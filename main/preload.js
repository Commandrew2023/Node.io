(function (module) {
    module.root = `https://cdn.jsdelivr.net/gh/Commandrew2023/Node.io@main/`;
    module.requestJS = (path) => {
        return new Promise(
            async (resolve, reject) => {
                const response = await fetch(`module.root${path}`);
                if (!response.ok) {
                    reject(response);
                    throw new Error(`Error loading js file: ${path}`);
                } else {
                    resolve(response);
                }
            }
        ).then((res) => {
            console.log(res);
        });
    };
    module.loadRequests = () => {
        module.requests.forEach(request => module.requestJS(request));
    };
    module.requests = [
        "main/index.js"
    ];
})(this);
