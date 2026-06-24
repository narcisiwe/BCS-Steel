# BCS Steel website

Static premium industrial website for BCS Steel.

## Structure

```text
BCS-Steel/
├─ index.html
├─ css/
│  └─ styles.css
├─ js/
│  └─ script.js
└─ img/
   ├─ Bending_1.jpg
   ├─ FiberLaser_1.jpg
   ├─ LaserCut_1.jpg
   ├─ LaserCut_2.jpg
   ├─ Logo_1.png
   ├─ Turning_1.jpg
   ├─ Turning_2.jpg
   └─ Welding_1.jpg
```

## Notes

- Latvian is the default language.
- Dark theme is the default theme.
- Light theme switch is commented out in `index.html` and `css/styles.css`.
- Hero slideshow uses `Turning_2.jpg` for the second slide.
- If you have a different `Turning_2.jpg`, replace the file in the `img` folder with the same name.
- Contact form uses `mailto:info@bcssteel.lv`; replace this address with the real company email.


## Update v7.1

- Hero / приветственный блок больше не растягивается на полный экран.
- Высота hero ограничена через `height: clamp(640px, 72vh, 760px)`.
- Фоновое изображение остается как широкий баннер и не выглядит растянутым на всю высоту страницы.


## v8 updates
- Hero slideshow switcher is attached to the hero section, not fixed to the browser window.
- Hero slide images use individual background sizing/positioning to avoid visual stretching.
- First laser cutting slide remains full cover; other slides keep their natural aspect ratio using `background-size: auto 100%` on desktop.
