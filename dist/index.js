!function(t,n){"object"==typeof exports&&"object"==typeof module?module.exports=n(require("react")):"function"==typeof define&&define.amd?define(["react"],n):"object"==typeof exports?exports.FSMRouter=n(require("react")):t.FSMRouter=n(t.React)}(window,(function(t){return function(t){var n={};function e(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,e),o.l=!0,o.exports}return e.m=t,e.c=n,e.d=function(t,n,r){e.o(t,n)||Object.defineProperty(t,n,{enumerable:!0,get:r})},e.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},e.t=function(t,n){if(1&n&&(t=e(t)),8&n)return t;if(4&n&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(e.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&n&&"string"!=typeof t)for(var o in t)e.d(r,o,function(n){return t[n]}.bind(null,o));return r},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},e.p="/dist/",e(e.s=1)}([function(n,e){n.exports=t},function(t,n,e){"use strict";e.r(n),e.d(n,"createMachine",(function(){return H})),e.d(n,"Link",(function(){return Y})),e.d(n,"Machine",(function(){return G})),e.d(n,"State",(function(){return F})),e.d(n,"Transition",(function(){return z})),e.d(n,"useMachine",(function(){return L}));var r=e(0),o=e.n(r);function a(t,n){var e=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(t,n).enumerable}))),e.push.apply(e,r)}return e}function i(t){for(var n=1;n<arguments.length;n++){var e=null!=arguments[n]?arguments[n]:{};n%2?a(Object(e),!0).forEach((function(n){c(t,n,e[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(e)):a(Object(e)).forEach((function(n){Object.defineProperty(t,n,Object.getOwnPropertyDescriptor(e,n))}))}return t}function c(t,n,e){return n in t?Object.defineProperty(t,n,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[n]=e,t}function u(t){return(u="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}var l=function(t){if(t.length){var n=s(o.a.Children.toArray(t),"State");if(n.length)return n;if(t.props&&t.props.children)return t.props.children.reduce((function(t,n){return t=t.concat(s(o.a.Children.toArray(n.props.children),"State"))}),[])}return[]},s=function(t,n){return t.filter((function(t){return t.type.displayName===n}))},f=function(t,n){return n.split(".").pop()===t},p=function(t){return/^:(.+)/.test(t)},d=function(t){return"/"===t},h=function(t){return t.split("/").filter(Boolean)},y=function(t,n){return"/"+h(t).map((function(t){if(p(t)){var e=t.replace(":","");return Object.keys(n).includes(e)?n[e].toString():(console.error("Cannot push to a dynamic URL without supplying the proper parameters: ".concat(t," parameter is missing.")),"undefined")}return t})).join("/")+(window.location.search?window.location.search:"")},m=function t(n,e){var r=e.find((function(t){return t.stack===n})),o=r.childStates,a={path:r.path,stack:r.stack};if(o.length){var i=o.map((function(t){return e.find((function(n){return n.id===t}))})),c=i.find((function(t){return t.initial}))||i[0];if(c.childStates.length)return t(c.stack,e);a.path=c.path||"/",a.stack=c.stack}return a},g=function(t,n,e){var r={params:{},path:null,stack:null,url:t},o=function(t,e){var o=m(t,n),a=o.path,c=o.stack;r=i(i({},r),{},{path:a,stack:c,url:y(a,r.params)})};if(d(t)){o(n[0].stack)}else{var a=function(t,n,e){var r={params:{},path:t,stack:null},o=n.find((function(n){return n.path===t}));if(o)return r.path=o.path,r.stack=o.stack,r;if(function(t){return""===t.slice(1)}(t))return r.stack=n.find((function(t){return 1===t.stack.match(/\./g).length&&t.initial})).stack,r;var a=n.filter((function(t){return t.path&&t.path.match(/\/:/g)})).map((function(t){return t.path}));if(a.length){var i=h(t),c=a.find((function(t){var n=h(t);return r.params={},n.length===i.length&&!n.map((function(t,n){return p(t)?(r.params[t.slice(1)]=i[n],!0):t===i[n]})).includes(!1)}));c&&(r.path=c,r.stack=n.find((function(t){return t.path===c})).stack)}if(!r.stack){var u=n.find((function(t){return"*"===t.id}));r.stack="#"+e+".*",u||console.warn('No <State/> configuration matches URL "'.concat(t,", and no catch-all <State id='*' path='/404'/> exists. Consider adding one."))}return r}(t,n,e),c=a.params,u=a.path,l=a.stack;r=i(i({},r),{},{params:c,path:u,stack:l}),function(t){return"*"===t.split(".").pop()}(l)||o(l)}return r},v=function t(n,e,r){if(!e.match(/\./g))return null;var o=r.find((function(t){return t.stack===e})).transitions;if(o.length){var a=o.find((function(t){var e=t.cond,r=t.event;t.target;return r===n&&(null===e||!0===e)}));if(a)return a}var i=e.split(".").slice(0,-1).join(".");return t(n,i,r)};function b(){return(b=Object.assign||function(t){for(var n=1;n<arguments.length;n++){var e=arguments[n];for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r])}return t}).apply(this,arguments)}var O,S=O||(O={});S.Pop="POP",S.Push="PUSH",S.Replace="REPLACE";var j=function(t){return t};function k(t){t.preventDefault(),t.returnValue=""}function w(){var t=[];return{get length(){return t.length},push:function(n){return t.push(n),function(){t=t.filter((function(t){return t!==n}))}},call:function(n){t.forEach((function(t){return t&&t(n)}))}}}function P(){return Math.random().toString(36).substr(2,8)}function A(t){var n=t.pathname,e=t.search;return(void 0===n?"/":n)+(void 0===e?"":e)+(void 0===(t=t.hash)?"":t)}function N(t){var n={};if(t){var e=t.indexOf("#");0<=e&&(n.hash=t.substr(e),t=t.substr(0,e)),0<=(e=t.indexOf("?"))&&(n.search=t.substr(e),t=t.substr(0,e)),t&&(n.pathname=t)}return n}function x(t,n){return function(t){if(Array.isArray(t))return t}(t)||function(t,n){var e=t&&("undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"]);if(null==e)return;var r,o,a=[],i=!0,c=!1;try{for(e=e.call(t);!(i=(r=e.next()).done)&&(a.push(r.value),!n||a.length!==n);i=!0);}catch(t){c=!0,o=t}finally{try{i||null==e.return||e.return()}finally{if(c)throw o}}return a}(t,n)||function(t,n){if(!t)return;if("string"==typeof t)return E(t,n);var e=Object.prototype.toString.call(t).slice(8,-1);"Object"===e&&t.constructor&&(e=t.constructor.name);if("Map"===e||"Set"===e)return Array.from(t);if("Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e))return E(t,n)}(t,n)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function E(t,n){(null==n||n>t.length)&&(n=t.length);for(var e=0,r=new Array(n);e<n;e++)r[e]=t[e];return r}var T=function(t,n){if(!n)return[[],function(){}];var e=x(Object(r.useState)([]),2),o=e[0],a=e[1];return[o,function(n){var e=n.type,r=n.payload,i=new Date,c="".concat(i.getHours(),":").concat(i.getMinutes(),":").concat(i.getSeconds(),".").concat(i.getMilliseconds()),u=r.event,l=r.target,s=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:e.replace(/_/g," ");return console.group("%cFSM-Router action: %c".concat(t," %c@ ").concat(c),"color: grey; font-weight: normal","font-weight: bold;","color: grey; font-weight: normal")},f=function(){return console.log("%cevent:","color: blue; font-weight: bold;",u)},p=function(){return console.log("%csource:","color: grey; font-weight: bold;",{state:t.current,location:t.location})},d=function(){l.exact?console.log("%ctarget","color: green; font-weight: bold;",{location:l.location,matched:l.exact,state:l.state}):console.log("%ctarget","color: green; font-weight: bold;",{state:l.state,location:l.location})};switch(e){case"TRANSITION":s(),f(),p(),d();break;case"NO_MATCHING_STATE":s("EVENT DISCARDED"),console.log('%cdetails: %cNo matching <State id="%c'.concat(l.state,'%c"/> found.'),"color: red; font-weight: bold;",null,"font-weight: bold; font-family: monospace;",null),f(),p(),console.log("%ctarget","color: green; font-weight: bold;",{state:l.state});break;case"NO_MATCHING_TRANSITION":s("EVENT DISCARDED"),console.log('%cdetails: %cNo matching <Transition id="%c'.concat(u,'%c"/> found within source state or any of its ancestors.'),"color: red; font-weight: bold;",null,"font-weight: bold; font-family: monospace;",null),f(),p();break;case"HISTORY_REPLACE":case"HISTORY_PUSH":case"HISTORY_POP":s(),console.log("%cpath","color: blue; font-weight: bold;",l.location.pathname),p(),d()}console.groupEnd(),a(o.concat({type:e,payload:r}))}]};function I(t,n){return function(t){if(Array.isArray(t))return t}(t)||function(t,n){var e=t&&("undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"]);if(null==e)return;var r,o,a=[],i=!0,c=!1;try{for(e=e.call(t);!(i=(r=e.next()).done)&&(a.push(r.value),!n||a.length!==n);i=!0);}catch(t){c=!0,o=t}finally{try{i||null==e.return||e.return()}finally{if(c)throw o}}return a}(t,n)||function(t,n){if(!t)return;if("string"==typeof t)return M(t,n);var e=Object.prototype.toString.call(t).slice(8,-1);"Object"===e&&t.constructor&&(e=t.constructor.name);if("Map"===e||"Set"===e)return Array.from(t);if("Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e))return M(t,n)}(t,n)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function M(t,n){(null==n||n>t.length)&&(n=t.length);for(var e=0,r=new Array(n);e<n;e++)r[e]=t[e];return r}function C(t,n){var e=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(t,n).enumerable}))),e.push.apply(e,r)}return e}function R(t){for(var n=1;n<arguments.length;n++){var e=null!=arguments[n]?arguments[n]:{};n%2?C(Object(e),!0).forEach((function(n){_(t,n,e[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(e)):C(Object(e)).forEach((function(n){Object.defineProperty(t,n,Object.getOwnPropertyDescriptor(e,n))}))}return t}function _(t,n,e){return n in t?Object.defineProperty(t,n,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[n]=e,t}var D=o.a.createContext({});D.displayName="Machine";var H=function(t){return function(n){return U(R(R({},n),t))}},L=function(){var t=Object(r.useContext)(D);return[{current:t.current,history:t.history,id:t.id,params:t.params},t.send]};function U(t){var n=t.children,e=t.history,a=t.id,i=void 0===a?"machine":a,c=t.ignoreHash,u=void 0!==c&&c,f=t.logging,p=void 0!==f&&f,h=Object(r.useMemo)((function(){return e||function(t){function n(){var t=i.location,n=c.state||{};return[n.idx,j({pathname:t.pathname,search:t.search,hash:t.hash,state:n.usr||null,key:n.key||"default"})]}function e(t){return"string"==typeof t?t:A(t)}function r(t,n){return void 0===n&&(n=null),j(b({},f,{},"string"==typeof t?N(t):t,{state:n,key:P()}))}function o(t){l=t,t=n(),s=t[0],f=t[1],p.call({action:l,location:f})}function a(t){c.go(t)}void 0===t&&(t={});var i=void 0===(t=t.window)?document.defaultView:t,c=i.history,u=null;i.addEventListener("popstate",(function(){if(u)d.call(u),u=null;else{var t=O.Pop,e=n(),r=e[0];if(e=e[1],d.length){if(null!=r){var i=s-r;i&&(u={action:t,location:e,retry:function(){a(-1*i)}},a(i))}}else o(t)}}));var l=O.Pop,s=(t=n())[0],f=t[1],p=w(),d=w();return null==s&&(s=0,c.replaceState(b({},c.state,{idx:s}),"")),{get action(){return l},get location(){return f},createHref:e,push:function t(n,a){var u=O.Push,l=r(n,a);if(!d.length||(d.call({action:u,location:l,retry:function(){t(n,a)}}),0)){var f=[{usr:l.state,key:l.key,idx:s+1},e(l)];l=f[0],f=f[1];try{c.pushState(l,"",f)}catch(t){i.location.assign(f)}o(u)}},replace:function t(n,a){var i=O.Replace,u=r(n,a);d.length&&(d.call({action:i,location:u,retry:function(){t(n,a)}}),1)||(u=[{usr:u.state,key:u.key,idx:s},e(u)],c.replaceState(u[0],"",u[1]),o(i))},go:a,back:function(){a(-1)},forward:function(){a(1)},listen:function(t){return p.push(t)},block:function(t){var n=d.push(t);return 1===d.length&&i.addEventListener("beforeunload",k),function(){n(),d.length||i.removeEventListener("beforeunload",k)}}}}()}),[]),S=I(Object(r.useMemo)((function(){var t,e=l(o.a.Children.toArray(n));if(0===e.length)throw new Error("<Machine/> has no children <State/> nodes! At least one is required to be considered a valid state machine.");return[e,(t=i,function t(n){var e=n.findIndex((function(t){return t.props.initial}));return e=e>=0?e:0,n.reduce((function(n,r,a){var i=r.props,c=i.children,u=i.id,f=i.parallel,p=i.path,h=void 0===p?"/":p,y=l(o.a.Children.toArray(c)),m=s(o.a.Children.toArray(c),"Transition").map((function(t){var n=t.props;return{cond:!0===n.cond||void 0===n.cond,event:n.event,sendId:u,target:n.target}}));return n.push({childStates:y.map((function(t){return t.props.id})),id:u,initial:e===a,path:h,stack:"."+u,transitions:m,type:f?"parallel":0===y.length?"atomic":y.length>1?"compound":"default"}),y.length&&t(y).forEach((function(t,e){return n.push({childStates:t.childStates,id:t.id,initial:t.initial,path:d(h)?t.path:d(t.path)?h:h+t.path,stack:"."+u+t.stack,transitions:t.transitions,type:t.type})})),n}),[])}(e).map((function(n){return n.stack="#"+t+n.stack,n})))]}),[n]),2),x=S[0],E=S[1],M=I(Object(r.useMemo)((function(){var t=g(h.location.pathname,E,i),n=t.params,e=(t.path,t.stack),r=t.url;return h.location.pathname!==r&&h.replace(r),[e,n]}),[]),2),C=M[0],_=M[1],H=I(Object(r.useState)({current:C,location:h.location,params:_}),2),L=H[0],U=H[1],G=I(T(L,p),2),V=(G[0],G[1]),Y=Object(r.useMemo)((function(){return h.listen((function(t){var n=t.action,e=t.location,r=g(e.pathname,E,i),o=r.params,a=(r.path,r.stack),c=r.url,l=a;e.pathname!==c&&h.replace(c),u&&L.location.hash!==e.hash?U((function(t){return R(R({},L),{},{location:h.location,params:o})})):(e.state&&e.state.target&&(l=e.state.target),"POP"!==n&&e.state&&e.state.target||V({type:"HISTORY_".concat(n),payload:{target:{target:l,params:o,location:h.location,state:a}}}),U((function(t){return{current:l,location:h.location,params:o}})))}))}));Object(r.useEffect)((function(){return Y}));var q=R(R({},L),{},{history:h,id:i,send:function(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,e=v(t,L.current,E);if(e){var r=n&&n.params||L.params,o=(e.event,e.target),a=E.find((function(t){return t.id===o}));if(a){var i=m(a.stack,E),c=i.path,u=i.stack,l=y(c,r);l!==h.location.pathname?h.push(l,{target:u}):U((function(t){return{current:u,location:h.location,params:r}})),V({type:"TRANSITION",payload:{event:t,target:{params:r,location:h.location,state:u}}})}else V({type:"NO_MATCHING_STATE",payload:{event:t,target:{params:r,state:o}}})}else V({type:"NO_MATCHING_TRANSITION",payload:{event:t}})}});return o.a.createElement(D.Provider,{value:q},x)}U.displayName="Machine";var G=U;function V(t){var n,e,a=t.children,i=t.className,c=t.disabled,l=void 0!==c&&c,s=t.href,f=void 0===s?"#":s,p=t.onClick,d=t.replace,h=void 0!==d&&d,y=Object(r.useContext)(D),m=(y.current,y.history);return o.a.createElement("a",{className:(n=[i,{"link-exact":f===m.location.pathname,"link-active":m.location.pathname.includes(f)&&!l,disabled:l}],e=n.map((function(t){switch(u(t)){case"string":return t;case"object":return Object.keys(t).filter((function(n){return Boolean(t[n])})).join(" ").trim();default:return null}})).join(" ").trim(),Boolean(e)?e:null),href:f,onClick:function(t){(t.preventDefault(),l)||(m[h?"replace":"push"](f),p&&p(t))}},a)}V.displayName="Link";var Y=V,q=o.a.createContext({id:null,path:null,stack:null});function B(t){var n=t.children,e=t.component,a=t.id,i=(t.initial,t.path),c=Object(r.useContext)(D),u=(c.event,c.current),l=c.history,s=c.id,p=c.params,d=c.send,h=Object(r.useContext)(q),y=(h.id,h.path),m=h.stack,g=m?"".concat(m,".").concat(a):"#".concat(s,".").concat(a),v=i?y?y+i:i:y,b=!!function(t,n){return!!n.split(".").find((function(n){return n===t}))}(a,u)&&{exact:f(a,u),params:p,path:v,url:l.location.pathname},O={id:a,path:v,stack:g,send:d},S={children:n,history:l,machine:{current:u,send:d},match:b};return b?o.a.createElement(q.Provider,{value:O},e?o.a.createElement(e,S):n):null}q.displayName="StateNode",B.displayName="State";var F=B,$=function(t){return null};$.displayName="Transition";var z=$}])}));
//# sourceMappingURL=index.js.map