import {Client, IFrame, IMessage} from '@stomp/stompjs';


interface IRabbitMQBody {
    result: string,
    type?: string,
    msg?: object[]
}


interface SymbolInfo {
    symbol_id: string;
    status: string;
    description: string;
    base_asset: string;
    quote_asset: string;
    base_precision: number;
    quote_precision: number;
    icon: string;
}

const FieldConstants:string[] = [
    'symbol_id', 'status', 'description', 'base_asset', 'quote_asset', 'base_precision', 'quote_precision', 'icon'
]

class AkrossExample {
    private root:HTMLElement = document.createElement('div');
    private client!:Client;
    private inputBox?:HTMLInputElement;
    private resultBox?:HTMLUListElement;
	private correlation_id: number = 0;
    private _listeners = new Map<string, (body: IRabbitMQBody) => void>();

    constructor(private container:HTMLElement) {
        this.container.append(this.root);
        this.client = new Client();
        this.client.brokerURL = "ws://192.168.0.45:15674/ws";
        this.client.onUnhandledMessage = (msg: IMessage) => {
            const headers = msg.headers;
            if ('correlation-id' in headers) {
                const cid = headers['correlation-id'];
                let listener = this._listeners.get(cid);
                if (listener) {
                    listener(JSON.parse(msg.body) as IRabbitMQBody);
                }
            }
            console.log('onUnHandledMessage', msg);
        };
    }

	private getCorrelationId(): number {
		return this.correlation_id++;
	}

    private async doSearch(query: string) : Promise<SymbolInfo[]>{
        console.log('doSearch before');
        return new Promise<SymbolInfo[]>((resolve, reject) => {
            const id = this.getCorrelationId().toString();
            
            this._listeners.set(id, (body) => {
                let result:SymbolInfo[] = [];
                if (body.msg && Array.isArray(body.msg)) {
                    for (let info of body.msg) {
                        const arr:any[] = (info as any[]).map((field, index) => {
                            return [FieldConstants[index], field]
                        });
                        console.log(arr);
                        result.push(Object.fromEntries(arr) as SymbolInfo);
                    }
                }
                resolve(result);
            });

            this.client.publish({
                destination: '/amq/queue/symbol_info',
                headers: {
                    'method': 'search',
                    'correlation-id': id,
                    'reply-to': '/temp-queue/response-queue'
                },
                binaryBody: new TextEncoder().encode(JSON.stringify({ 'keyword': query }))
            });
            
        });
    }

    private addInputBox(): void {
        this.inputBox = document.createElement('input') as HTMLInputElement;
        this.resultBox = document.createElement('ul') as HTMLUListElement;
        this.inputBox.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (this.inputBox && this.inputBox.value.length > 0) {
                    this.doSearch(this.inputBox.value)
                    .then((result) => {
                        for (let info of result) {
                            this.resultBox?.appendChild(
                                document.createTextNode(JSON.stringify(info))
                            );
                        }
                    });
                }
            }
        });
        this.root.append(this.inputBox);
        this.root.append(this.resultBox);
    }

    private async connectClient(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.client.onConnect = (frame:IFrame) => {
                resolve('connected');
            };
            this.client.onStompError = (frame:IFrame) => {
                reject('stomp_error');
            }
            this.client.onDisconnect = (frame:IFrame) => {
                reject('disconnected');
            }
            this.client.activate();
        });
    }

    async open(): Promise<void>{
        await this.connectClient();
        this.addInputBox();
    }
}


export function create(container:HTMLElement) : void{
    new AkrossExample(container).open().then(() => {
        console.log('OK');
    });
}