[See English version](/README.md)

# Historial de Medium en JSON

## Obtén tu historial de Medium en 17ms en formato JSON utilizando Cloudflare Workers

![respuesta a petición en 17ms ](/img/17-ms-response.png "respuesta a petición en 17ms")

### ¿Qué hay en este repositorio?



Una [fachada](https://es.wikipedia.org/wiki/Facade_(patr%C3%B3n_de_dise%C3%B1o)) que une diferentes APIs de Medium para devolver una interfaz de API limpia y simple para obtener un historial de Medium.


Contiene todo el código necesario para ser utilizado en  [Cloudflare Workers](https://workers.cloudflare.com/).

### [Demo en vivo](https://medium-feed.alekrumkamp.workers.dev/)

***

### 
## Cómo empezar

### Utilizando código preprocesado en cloudflareworkers.com
Para tener una idea de qué tan fácil es obtener tu historial de Medium, simplemente copia el [script.js](/worker/script.js) y edita la línea `const username = 'alekrumkamp'` por tu usuario de Medium.

Luego, ve a [cloudflareworkers.com](cloudflareworkers.com) y pega el código en el editor y haz click en el botón `Update`.

Después de unos segundos deberías poder ver tu historial de Medium.

***

### Súbelo de manera gratuita a un subdominio de workers.dev

Ahora que jugamos un poco, es tiempo de subir nuestro código a un Cloudflare Worker.

Para realizar esto, necesitas tener una [cuenta gratuita de Cloudflare](https://dash.cloudflare.com/sign-up)

Una vez que tengas una, no necesitas agregar un dominio personalizado. Sólo ve a [cloudflareworkers.com](cloudflareworkers.com) y haz click en login.

Deberías poder ver lo siguiente:

![Workers](/img/workers.png "Workers")

Haz click para poder avanzar al siguiente paso; seleccionar tu subdominio workers.dev único.

![Menú de selección de subdominios](/img/subdomain-selection-menu.png "Menú de selección de subdominios")

Ahora que tenemos nuestro subdominio, ¡Podemos crear nuestro Worker!

![Botón para crear nuevo Worker](/img/create-worker-button.png "Botón para crear nuevo Worker")

Aquí encontrarás un editor similar al que está presente en cloudflareworkers.com. La diferencia es que esta vez, el código será subido a un subdominio de tu Worker.

Pega el código de `worker/script.js` con tu nombre de usuario en el editor.

![Editor de Worker](/img/worker-editor.png "Editor de Worker")

Para hacerlo, haz click en el botón `Save and deploy`.

![Botón Save and deploy](/img/save-and-deploy-button.png "Botón Save and deploy")


_¡Y listo!_

Tu código debería estar funcionando después de pocos segundos en `https://{workerName}.{workersSubdomain}.workers.dev`

Si quieres cambiar de nombre a tu worker, en la esquina superior izquiera puedes hacerlo:

![Campo para cambiar nombre de Worker](/img/change-name-field.png "Campo para cambiar nombre de Worker")

***

### Obteniendo todas las entradas
Cada petición devuelve un máximo de 10 articulos. Sin embargo el atributo `next` puede ser utilizado para devolver las próximas 10 entradas.

Simplemente llama al worker con el query param `next` con su valor correspondiente.

Por ejemplo:

Pedido inicial:

`https://medium-feed.alekrumkamp.workers.dev/`

Pedido subsecuente:

`https://medium-feed.alekrumkamp.workers.dev/?next=1483371523050`

Una vez que todos los articulos han sido traídos, el atributo `next` ya no estará más presente.

***

### ¿Puedo utilizar Wrangler para hacer un build, una previsualización y publicar este proyecto a Cloudflare Workers?

¡Claro que si!

De hecho, este proyecto entero fue construido utilizando [Wrangler](https://github.com/cloudflare/wrangler).

Una vez que pasa la magia de jugar en el [parque de juegos](https://cloudflareworkers.com) y necesitas versionar código y utilizar otras herramientas, puedes encontrar que Wrangler viene a mano para probar y subir cosas a este ambiente sin servidores.

Notarás que incluí un archivo `webpack.config.js` personalizado en el repositorio.

Si quieres hacer más compacto el código antes de subirlo, puedes hacerlo simplemente eliminando el archivo.

Sin embargo si te encuentras depurando código y quieres ver mensajes de errores que sirvan del estilo `Error en la línea X`, te sugiero que no lo hagas.


***

### Utilizando un dominio personalizado

Después de haber agregado un dominio personalizado a Cloudflare, puedes ir a la sección de Workers :

![Menú de Workers](/img/workers-menu.png "Menú de Workers")

Habiendo abierto el editor, ve a `Routes` para agregar una ruta.

![Menú de rutas](/img/routes-menu.png "Menú de rutas")

![Botón para agregar nueva ruta](/img/route-button.png "Botón para agregar nueva ruta")

Ahora, simplemente es hacer una relación entre una ruta y su correspondiente Worker.

![Modal para crear nueva ruta](/img/route-modal.png "Modal para crear nueva ruta")

***

### Mis peticiones están tardando considerablemente más de  17ms
Todas las peticiones necesitan ser traídas desde Medium la primera vez por cada región de cache de Cloudflare. Sin embargo luego de esto, los pedidos serán entregados con muchísima velocidad.