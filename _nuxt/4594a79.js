(window.webpackJsonp=window.webpackJsonp||[]).push([[17],{274:function(e,t){e.exports="\t\n\v\f\r                　\u2028\u2029\ufeff"},275:function(e,t,r){var o=r(3),n=r(23),c=r(13),d=r(274),f=o("".replace),l="["+d+"]",m=RegExp("^"+l+l+"*"),v=RegExp(l+l+"*$"),x=function(e){return function(t){var r=c(n(t));return 1&e&&(r=f(r,m,"")),2&e&&(r=f(r,v,"")),r}};e.exports={start:x(1),end:x(2),trim:x(3)}},290:function(e,t,r){var content=r(305);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,r(105).default)("3e0d3f0f",content,!0,{sourceMap:!1})},302:function(e,t,r){"use strict";var o=r(2),n=r(275).trim;o({target:"String",proto:!0,forced:r(303)("trim")},{trim:function(){return n(this)}})},303:function(e,t,r){var o=r(79).PROPER,n=r(4),c=r(274);e.exports=function(e){return n((function(){return!!c[e]()||"​᠎"!=="​᠎"[e]()||o&&c[e].name!==e}))}},304:function(e,t,r){"use strict";r(290)},305:function(e,t,r){var o=r(104)(!1);o.push([e.i,"*[data-v-c4fa4cae]{font-family:Helvetica,Arial,sans-serif;box-sizing:border-box}main[data-v-c4fa4cae]{width:100%;justify-content:center}#feedback-form[data-v-c4fa4cae],main[data-v-c4fa4cae]{height:100%;display:flex}#feedback-form[data-v-c4fa4cae]{width:50%;max-width:500px;flex-direction:column;align-items:center;grid-gap:15px;gap:15px}#feedback-form textarea[data-v-c4fa4cae]{width:100%;padding:15px;border:2px solid #643296;border-radius:15px;resize:none;flex:1;outline:none;font-size:large;font-family:monospace}#feedback-form textarea[data-v-c4fa4cae]:focus{box-shadow:0 0 3px #b478f0}#feedback-form button[data-v-c4fa4cae]{min-width:200px;padding:8px;border:2px solid #643296;border-radius:25px;font-size:large;background-color:#643296;color:#fff;transition:background-color .25s ease,color .25s ease}#feedback-form button[data-v-c4fa4cae]:active{box-shadow:0 0 3px #b478f0}#feedback-form button[data-v-c4fa4cae]:hover{cursor:pointer;background-color:#fff;color:#000}#response h2[data-v-c4fa4cae]{color:#643296;letter-spacing:1px;word-spacing:5px}",""]),e.exports=o},319:function(e,t,r){"use strict";r.r(t);r(302);var o=r(10),n=(r(58),r(18),{name:"FeedbackPage",data:function(){return{state:"feedback",message:"",disabled:!1}},methods:{submit:function(){var e=this;return Object(o.a)(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(!e.message){t.next=5;break}return e.disabled=!0,t.next=4,fetch("https://api.telegram.org/bot5402297736:AAH8XhVS4d_xZJHyeGK66m0fEGPXWuO4Izg/sendMessage",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","cache-control":"no-cache"},body:JSON.stringify({chat_id:"1462793878",text:"DiceDistro\n\n"+e.message})});case 4:e.state="response";case 5:case"end":return t.stop()}}),t)})))()}}}),c=(r(304),r(43)),component=Object(c.a)(n,(function(){var e=this,t=e._self._c;return t("main",[t("div",{directives:[{name:"show",rawName:"v-show",value:"feedback"===e.state,expression:"state === 'feedback'"}],attrs:{id:"feedback-form"}},[t("textarea",{directives:[{name:"model",rawName:"v-model.trim",value:e.message,expression:"message",modifiers:{trim:!0}}],attrs:{disabled:e.disabled,placeholder:"Please enter your feedback here"},domProps:{value:e.message},on:{input:function(t){t.target.composing||(e.message=t.target.value.trim())},blur:function(t){return e.$forceUpdate()}}}),e._v(" "),t("button",{attrs:{disabled:e.disabled},on:{click:function(t){return e.submit()}}},[e._v("Sumbit")])]),e._v(" "),t("div",{directives:[{name:"show",rawName:"v-show",value:"response"===e.state,expression:"state === 'response'"}],attrs:{id:"response"}},[t("h2",[e._v("Thank You!")])])])}),[],!1,null,"c4fa4cae",null);t.default=component.exports}}]);