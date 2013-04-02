function DirReader(e){var t=this;if(!(t instanceof DirReader))throw new Error("DirReader must be called as constructor.");if(e.type!=="Directory"||!e.Directory)throw new Error("Non-directory type "+e.type);t.entries=null,t._index=-1,t._paused=!1,t._length=-1,e.sort&&(this.sort=e.sort),Reader.call(this,e)}module.exports=DirReader;var fs=require("../../graceful-fs/graceful-fs.js"),fstream=require("../fstream.js"),Reader=fstream.Reader,inherits=require("../../inherits/inherits.js"),mkdir=require("../../mkdirp"),path=require("path"),Reader=require("./reader.js"),assert=require("assert").ok;inherits(DirReader,Reader),DirReader.prototype._getEntries=function(){var e=this;if(e._gotEntries)return;e._gotEntries=!0,fs.readdir(e._path,function(t,n){function r(){e._length=e.entries.length,typeof e.sort=="function"&&(e.entries=e.entries.sort(e.sort.bind(e))),e._read()}if(t)return e.error(t);e.entries=n,e.emit("entries",n),e._paused?e.once("resume",r):r()})},DirReader.prototype._read=function(){var e=this;if(!e.entries)return e._getEntries();if(e._paused||e._currentEntry||e._aborted)return;e._index++;if(e._index>=e.entries.length){e._ended||(e._ended=!0,e.emit("end"),e.emit("close"));return}var t=path.resolve(e._path,e.entries[e._index]);assert(t!==e._path),assert(e.entries[e._index]),e._currentEntry=t,fs[e.props.follow?"stat":"lstat"](t,function(n,r){function a(){if(u)return;u=!0,e.emit("childEnd",o),e.emit("entryEnd",o),e._currentEntry=null,e._paused||e._read()}if(n)return e.error(n);var i=e._proxy||e;r.path=t,r.basename=path.basename(t),r.dirname=path.dirname(t);var s=e.getChildProps.call(i,r);s.path=t,s.basename=path.basename(t),s.dirname=path.dirname(t);var o=Reader(s,r);e._currentEntry=o,o.on("pause",function(t){!e._paused&&!o._disowned&&e.pause(t)}),o.on("resume",function(t){e._paused&&!o._disowned&&e.resume(t)}),o.on("stat",function(t){e.emit("_entryStat",o,t);if(o._aborted)return;o._paused?o.once("resume",function(){e.emit("entryStat",o,t)}):e.emit("entryStat",o,t)}),o.on("ready",function f(){if(e._paused)return o.pause(e),e.once("resume",f);o.type==="Socket"?e.emit("socket",o):e.emitEntry(o)});var u=!1;o.on("close",a),o.on("disown",a),o.on("error",function(t){o._swallowErrors?(e.warn(t),o.emit("end"),o.emit("close")):e.emit("error",t)}),["child","childEnd","warn"].forEach(function(t){o.on(t,e.emit.bind(e,t))})})},DirReader.prototype.disown=function(e){e.emit("beforeDisown"),e._disowned=!0,e.parent=e.root=null,e===this._currentEntry&&(this._currentEntry=null),e.emit("disown")},DirReader.prototype.getChildProps=function(e){return{depth:this.depth+1,root:this.root||this,parent:this,follow:this.follow,filter:this.filter,sort:this.props.sort}},DirReader.prototype.pause=function(e){var t=this;if(t._paused)return;e=e||t,t._paused=!0,t._currentEntry&&t._currentEntry.pause&&t._currentEntry.pause(e),t.emit("pause",e)},DirReader.prototype.resume=function(e){var t=this;if(!t._paused)return;e=e||t,t._paused=!1,t.emit("resume",e);if(t._paused)return;t._currentEntry?t._currentEntry.resume&&t._currentEntry.resume(e):t._read()},DirReader.prototype.emitEntry=function(e){this.emit("entry",e),this.emit("child",e)};