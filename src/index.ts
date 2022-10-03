import {create} from "./web.main"

function domContentLoaded(): Promise<unknown> {
    return new Promise<unknown>((resolve) => {
        const readyState = document.readyState;

        if (readyState === "complete" && (document && document.body != null)) {
            resolve(undefined);
        }
        else {
            window.addEventListener('DOMContentLoaded', resolve, false);
        }
    });
}



(function () {
    domContentLoaded().then(() => {
        create(document.body);
    });
})();