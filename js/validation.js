export const MAX_DRAWING_BYTES=10*1024*1024;
export function validDrawing(file){return !file||(file.size>0&&file.size<=MAX_DRAWING_BYTES&&/\.(pdf|dxf|dwg|step|stp)$/i.test(file.name));}
export function validPhone(value){
  const phone=String(value).trim();
  if(!/^\+?[\d\s().-]+$/.test(phone))return false;
  let digits=phone.replace(/\D/g,'');
  if(phone.startsWith('00'))digits=digits.slice(2);
  return digits.length>=7&&digits.length<=15;
}
export function prepareInquiry(data,c,filename){
  const service=c.serviceNames[Number(data.service)];
  const body=[...['name','company','email','phone'].map((name,i)=>`${c.fields[i]}: ${data[name]||'—'}`),`${c.fields[4]}: ${service}`,'',data.message,'',filename?`${c.fields[6]}: ${filename} (${c.formNote})`:''].join('\n');
  return 'mailto:bcslasercut@gmail.com?subject='+encodeURIComponent('BCS Steel — '+service)+'&body='+encodeURIComponent(body);
}
