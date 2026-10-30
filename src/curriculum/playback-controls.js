const paths={prev:['M19 4l-10 8 10 8z','M5 4v16'],next:['M5 4l10 8-10 8z','M19 4v16'],play:['M7 4l13 8-13 8z'],pause:['M7 4v16','M17 4v16'],all:['M3 5l9 7-9 7z','M12 5l9 7-9 7z']};
export function setPlaybackIcon(button,kind,label){
 button.replaceChildren();button.classList.add('playback-icon');button.setAttribute('aria-label',label);button.title=label;
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.7');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('stroke-linecap','round');
 for(const data of paths[kind]){const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',data);svg.append(path);}button.append(svg);
}
