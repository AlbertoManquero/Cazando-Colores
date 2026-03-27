# Cazando-Colores
Proyecto de identificación de colores con la cámara. La intención es que el usuario pase por los puntos del mapa dónde se encuentran flores de los distintos 9 colores, la cámara sólo funciona cuándo se apunta al color deseado y el siguiente color no queda desbloqueado hasta completar el anterior.
Más que un proyecto formal es una actividad de cumpleaños que hice para una amistad muy querida, pero ps ocupo el hosting de github para poder salir a caminar con el celular sin la necesidad de hacer local host.

{ id: 'white', name: "Blanco", hex: "#FFFFFF", h: [0, 360], s: [0, 30], l: [5, 360] },

h = Hue, cambia el rango del tono
s = Saturation, define lo "vivo" del color, entre grisaseo o el color bien "coloreado"
l = Lightness, el rango que detecta la oscuridad o iluminación del color

Orden de los colores. Utiliza la id para ordenarlos
const huntOrder = ['white', 'red', 'yellow', 'pink', 'magenta', 'lila', 'green', 'orange', 'blue'];

Mapa:
src="https://www.google.com/maps/d/u/0/embed?mid=10-bQBClo6qu1e6BK9yirCguBxUJphuI&ehbc=2E312F&noprof=1"

https://www.google.com/maps/d/u/0/edit?mid=10-bQBClo6qu1e6BK9yirCguBxUJphuI&ll=28.69822932784093%2C-106.12999061460017&z=19

Herramienta gratuita que permite crear "carpetas de lugares", muy útil para evitar poner la integraciíon del uso de gps en la página, sólo uso la api de google como tal :3
