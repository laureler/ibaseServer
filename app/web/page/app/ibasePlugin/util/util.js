export default {
  htmlDecode: function (str) {
    if(!str) return "";
    var s=str.replace(/&lt;/g,'<')
      .replace(/&gt;/g,'>')
      .replace(/&apos;/g,'\'')
      .replace(/&quot;/g,'\"')
      .replace(/&#13;/g,'\r')
      .replace(/&#10;/g,'\n')
      .replace(/&#92;/g,'\\')
      .replace(/&amp;/g,'&');
    return s;
  },
  htmlEncode: function (str) {
    if(!str) return "";
    return str.replace(/[&<>'\"\r\n]/g,function(c){
      switch(c) {
        case '&':return '&amp;';
        case '<':return '&lt;';
        case '>':return '&gt;';
        case '\'':return '&apos;';
        case '\"':return '&quot;';
        case '\r':return '&#13;';
        case '\n':return '&#10;';
        case '\\':return '&#92;';
      }
    });
  },
  urlEncode: function (str) {
    if(!str) return "";
    var s=str.replace(/</,"%3C").replace(/>/,"%3E")
      .replace(/'/,"%27").replace(/"/,"%22")
      .replace(/\\/,"%5C");
    return s;
  }
}
