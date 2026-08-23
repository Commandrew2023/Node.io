(function (module) {
    class Vector {
        constructor (x, y) {
            this.x = x;
            this.y = y;
        }
        static create () {
            // For Later
        }
        static angleBetween (v1, v2) {
            return Math.atan2(v2.y - v1.y, v2.x - v1.x);
        }
        static dist (p1, p2) {
            return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
        }
        static basisFromAngle (angle) {
            return new Vector(Math.cos(angle), Math.sin(angle));
        }

        /* Math Methods */
        add (Vec) {
            this.x += Vec.x;
            this.y += Vec.y;
        }
        mult (scalar) {
            this.x *= scalar;
            this.y *= scalar;
        }

        /* Modifying Methods */
        mag () {
            return Vector.dist({x : 0, y : 0}, this);
        }
        dot (Vec) {
            return this.x * Vec.x + this.y * Vec.y;
        }
        project (Vec) {
            let Target = new Vector(this.x, this.y);
            Target.mult( Target.dot(Vec) / Math.pow(Target.mag(), 2) );
            return Target;
        }
        basis () {
            let m = this.mag();
            return new Vector(this.x / m, this.y / m);
        }
        equals (Vec, acc=10000) {
            return Math.floor(Vec.x * acc) === Math.floor(this.x * acc) && Math.floor(Vec.y * acc) === Math.floor(this.y * acc);
        }
        copy () {
            let newVec = new Vector(this.x, this.y);
            return newVec;
        }
        inv () {
            let newVec = new Vector(-this.x, -this.y);
            return newVec;
        }
    }
    module.Vector = Vector;
})(this);
