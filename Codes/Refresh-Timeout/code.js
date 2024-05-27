onInit: function () {
  //[...]
  //Set reload apos 5 min. Reinicia contagem se usuario mexer no mouse ou digitar algo
  this.fTimeOut = function () {
    this._TimeOutId ? clearTimeout(this._TimeOutId) : null;
    this._TimeOutId = setTimeout(() => { location.reload() }, 300000);
  }
  
  document.onmousemove = this.fTimeOut
  document.onkeydown = this.fTimeOut
  document.onkeyup = this.fTimeOut
  
  this.fTimeOut();
}
