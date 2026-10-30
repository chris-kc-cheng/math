import katex from 'katex';

// Small DOM helpers shared by every page and view.
export const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
// True when the learner asked the system for less motion; animations must then be skipped and playback stepped manually.
export const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
// Render LaTeX into a node (same argument order as katex.render), rejecting anything KaTeX cannot parse (no HTML, no trusted commands).
export const renderTex=(tex,node,{display=true}={})=>katex.render(tex,node,{displayMode:display,throwOnError:true,trust:false});
