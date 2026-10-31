export const workPhotos = [
  '20211208_153339_2x_2x.jpg',
  '20211209_133109_2x_2x.jpg',
  '20211215_154437_2x_2x.jpg',
  '20211208_153241_2x_2x.jpg',
  '20211215_154416_2x_2x.jpg',
  '20211208_153220_2x_2x.jpg'
];
export const galleries = [
  workPhotos.map((source,i)=>({thumb:`media/gallery/work-${i}.webp`,full:`media/gallery/full/${source}`,altIndex:i,illustrative:false})),
  Array.from({length:8},(_,i)=>({thumb:`media/products/product-${i}.webp`,full:`media/gallery/full/product-${i}.webp`,altIndex:i,illustrative:true}))
];
