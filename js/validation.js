export const MAX_DRAWING_BYTES=10*1024*1024;
export function validDrawing(file){return !file||(file.size>0&&file.size<=MAX_DRAWING_BYTES&&/\.(pdf|dxf|dwg|step|stp)$/i.test(file.name));}
