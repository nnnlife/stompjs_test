import {Client, IFrame} from '@stomp/stompjs';


class AkrossExample {
    private root:HTMLElement = document.createElement('div');
    private client!:Client;
    private inputBox?:HTMLInputElement;

    constructor(private container:HTMLElement) {
        this.container.append(this.root);
        this.client = new Client();
        this.client.brokerURL = "";
    }

    private addInputBox(): void {
        this.inputBox = document.createElement('input') as HTMLInputElement;
        this.inputBox.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                console.log('Entered', this.inputBox?.value);
            }
        });
        this.root.append(this.inputBox);
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