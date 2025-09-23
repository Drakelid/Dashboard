import{s as i,r as e,_ as c,$ as n}from"./index-6lVp-ZfY.js";/**
 * @license lucide-vue-next v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=i("star",[["path",{d:"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",key:"r04s7s"}]]),o=e(null),l=e(null),r=e(!1),t=e(null);function v(){async function s(){r.value=!0,t.value=null;try{const a=await c();o.value=a,a?.vehicle?l.value=a.vehicle:l.value=await n().catch(()=>null)}catch(a){throw t.value=a?.message||"Failed to load profile",a}finally{r.value=!1}}return{profile:o,vehicle:l,loading:r,error:t,load:s}}export{f as S,v as u};
