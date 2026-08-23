(function (module) {
    module.__root = `https://cdn.jsdelivr.net/gh/Commandrew2023/Node.io@latest/`;
    module.__requests = [
        "main/index.js"
    ];
    module.__generateRequests = () => {
        module.__requests.forEach(request => {
            let script = document.createElement('script');
            script.src = `${module.__root}${request}`;
            script.setAttribute('request', request);
            script.addEventListener('load', (e) => {
                let request = e.currentTarget.getAttribute('request');
                module.__requests[request] = {
                    "url" : e.currentTarget.src,
                    "request" : request,
                    "complete" : true
                };
            });
            document.head.appendChild(script);
        });
    };
    module.__checkRequests = setInterval(() => {
        let passes = false;
        module.__requests.forEach(request => {
            if (typeof request !== 'string') {
                console.log(request);
            }
        });
    }, 0);
})(this);
