(function () {
  class Popup {
    #currentStep;
    #updateLoop;
    constructor (title, body) {
      this.DOM_Element = null;

      this.message = { title, body };
      
      this.duration = Infinity;
      this.#currentStep = 0;
      this.#updateLoop = setInterval((that) => {
        that.#currentStep++;
        if (that.#currentStep >= that.duration) {
          that.#setInactive();
          setTimeout((that) => {
            that.remove();
          }, 2000, that);
        }
      }, 1, this);
    }
    #setActive () {
      if (this.DOM_Element !== null) {
        this.DOM_Element.setAttribute('popup-active', true);
      }
    }
    #setInactive () {
      if (this.DOM_Element !== null) {
        this.DOM_Element.setAttribute('popup-active', false);
      }
    }
    setDuration (duration) {
      this.duration = duration;
    }
    deploy () {

      /* Build popup node */
      const popup = HTML_Build({
        type : 'div',
        classes : ['popup'],
        children : [
          {
            type : 'div',
            html : this.message.title,
          },
          {
            type : 'div',
            html : this.message.body
          }
        ]
      });

      /* Bind popup node to object */
      this.DOM_Element = popup;
      this.#setActive();

      /* Append node to body */
      document.querySelector('body').appendChild(popup);

      /* Redefine Popups flat */
      module.Flats.Popups = [this];
    }
    remove () {
      this.DOM_Element.remove();
      module.Flats.Popups = [];
    }
  }
  module.Popup = Popup;
})(this);
