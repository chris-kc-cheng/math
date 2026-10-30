// Restore controls that actually exist, rather than naming controls from an old setup UI.
export function setActionBusy(root,busy,{ready,countValid}){
 root.querySelectorAll('#game-setup button,#game-quit,#game-round button,#game-round input').forEach(control=>{control.disabled=busy;});
 const start=root.querySelector('#game-start');
 if(start)start.disabled=busy||!ready||!countValid;
}
