(function (module) {
    class AlternativeCrypto {
        constructor (options) {
            this.FALLBACK_LENGTH = 32;
            this.MAX_LENGTH = ~~(options.max_length ?? this.FALLBACK_LENGTH);
            this.MIN_LENGTH = ~~(options.min_length ?? this.FALLBACK_LENGTH);
            this.LENGTH = ~~(options.length ?? this.FALLBACK_LENGTH);
            
            /* Ensure LENGTH is between min/max values */
            this.LENGTH = Math.max(this.MIN_LENGTH, Math.min(this.MAX_LENGTH, this.LENGTH));
        }
        static randomUUID (check = { objects : [], key : 'uuid' }) {
            while (true) {
                /* Cryptographically Secure UUID */
                /* - Credit to @broofa on stackoverflow.com {post converted to community wiki} */
                let id = "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
                    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
                );
                if (!check) return id;

                /* Iterate checkable items */
                if (!!check?.objects && !!check?.key) {
                    /*if (check.objects.reduce((acc, item) => {
                      return (item?.[check.key] === id) || acc;
                    })) {*/
                    let copyFound = false;
                    check.objects.forEach(item => {
                        if (item?.[check.key] === id) copyFound = true;
                    });
                    if (!copyFound) {
                        return id;
                    }
                } else {
                    throw new TypeError("Parameter 'check' requires 'object' and 'key' fields.");
                }
            }
        }
        create () {
            /* Cryptographically Not Secure ID */
            return (new Int8Array(options.LENGTH).fill(1).map(_ => String.fromCharCode(~~(Math.random() * 26) + 65))).join('');
        }
    }
    module.AlternativeCrypto = AlternativeCrypto;
})(this);
