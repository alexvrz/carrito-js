//leer la api inventada
//tenemos un addevent listener que va a esperar que se lea todo el html y luego se ejecute una funcion
// vamos a agregar un domcontentloaded que se dispara cunado el documento html ha sido cargado
const cards = document.getElementById('cards')
const items = document.getElementById('items')
const footer= document.getElementById('footer')
const templateCard = document.getElementById('template-card').content //para acceder al contenido del template
const templateFooter = document.getElementById('template-footer').content
const templateCarrito = document.getElementById('template-carrito').content
const fragment = document.createDocumentFragment()
let carrito = {}



document.addEventListener('DOMContentLoaded', () => {
    fetchData()//aca se llama al fetchdata
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'))
        pintarCarrito()
    }
})
cards.addEventListener('click', e => {
    addCarrito(e)
})
items.addEventListener("click", e => {
    btnAction(e)
})

const fetchData = async () => {
    try {
        const res = await fetch('api.json')
        const data = await res.json()
        //console.log(data);
        pintarCards(data)
    } catch (error) {
        console.log(error);
        
    }
}
const pintarCards = data => {
    data.forEach(product => {
        //console.log(product);
        templateCard.querySelector('h5').textContent = product.title
        templateCard.querySelector('p').textContent = product.precio
        templateCard.querySelector('img').setAttribute('src', product.thumbnailUrl)
        templateCard.querySelector('.btn-dark').dataset.id= product.id //para poner el id del respectivo producto al boton 

        const clone = templateCard.cloneNode(true)
        fragment.appendChild(clone)
    });
    cards.appendChild(fragment)
}
const addCarrito = e => {
    //console.log(e.target);
    //console.log(e.target.classList.contains('btn-dark'));
    if (e.target.classList.contains('btn-dark')) {
        //console.log(e.target.parentElement);//esto lo que hace es que al dar click en el boton se traiga especiamente ese objeto con su respectiva informacion para ponerla luego en el carro
        setCarrito(e.target.parentElement)//empuja la info a set carrito
    }
    e.stopPropagation()//esto es para evitar que se herede eventos a otros elementos. recordar comentar esta linea para ver como funciona*************
}
const setCarrito = objeto => {
    const producto={
        id: objeto.querySelector('.btn-dark').dataset.id,
        title: objeto.querySelector('h5').textContent,
        precio: objeto.querySelector('p').textContent,
        cantidad: 1

    }//es una coleccion de objetos que tiene un producto y solo le paso los datos que quiero que el carrito tenga, recordando en que clase o etiqueta esta esa info, se crea el objeto con toda esa info
    
    if (carrito.hasOwnProperty(producto.id)) {
        producto.cantidad= carrito[producto.id].cantidad + 1
    }
    //si carrito, que ahora esta vacio, pero puede ser que se repita el producto, tiene unaa propiedad x, y pasamos el id del producto, si el if existe eso quiere decir que el producto se repite, por lo tanto solo se ocupa aunmentar la cantidad, por lo tanto producto.cantidad va a ser igual a la suma de carrito de producto.id con su cantidad +1 con el if anterior solo se accede al id del producto en especifico y luego a la cantidad para luego ser esta modificada

    carrito[producto.id]={...producto}//con el producto.id
//console.log(carrito);
    //ahora se empuja el producto al carrito
    pintarCarrito()//el carrito se pinta cuando se agrega un producto
}// actua como intermediario para el let carrito de arriba
const pintarCarrito = () => {
   // console.log(carrito);//object.values se usa para poder hacer un foreach de un objeto
    items.innerHTML= "" //quiere decir que parte vacio, asi no se repiten elementos
    Object.values(carrito).forEach(producto => {
        templateCarrito.querySelector('th').textContent = producto.id
        templateCarrito.querySelectorAll('td')[0].textContent = producto.title
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad //accede al primer td de todos los que hay
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id
        templateCarrito.querySelector('span').textContent = producto.cantidad * producto.precio // cada vez que se aumente la cantidad el precio tambien lo hace
        const clone = templateCarrito.cloneNode(true)
        fragment.appendChild(clone)
    })
    items.appendChild(fragment)

    pintarFooter()// el footer se pinta cuando se agrega un producto al carrito
    localStorage.setItem('carrito', JSON.stringify(carrito))
}
const pintarFooter = () => {
    footer.innerHTML = "" //cuando el footer este vacio tenemos que reiniciar esta informacion, para que no se sobre escriba la info
    if (Object.keys(carrito).length === 0) {
        footer.innerHTML = `
         <th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>
        `
        return
        // es un solo componente, por lo tanto no afecta mucho si se usa esta opcion, cuando detecta que el carrito esta vacio hay que poner un return, caso contrario va a seguir mostrando lo de abajo
    }//Object.keys(carrito).length se usa para determinar la longitud del objeto, esto dice que si el carrito es igual a cero items que ponga tal cosa
    const nCantidad = Object.values(carrito).reduce((acc, { cantidad }) => acc + cantidad, 0)//acumula la cantidad,cantidad es objeto, acc=acumulador
    const nPrecio = Object.values(carrito).reduce((acc, { cantidad ,precio}) => acc + cantidad*precio, 0)
    //console.log(nCantidad)
    templateFooter.querySelectorAll('td')[0].textContent = nCantidad
    templateFooter.querySelector('span').textContent = nPrecio
    const clone = templateFooter.cloneNode(true)
    fragment.appendChild(clone)
    footer.appendChild(fragment)

    const btnVaciar = document.getElementById('vaciar-carrito')
    btnVaciar.addEventListener('click', () => {
        carrito = {}
        pintarCarrito()//para que sepa que no hay ningun elemento en cuestion
    })

}
const btnAction = e => {
    //accion de aumentar
    if (e.target.classList.contains('btn-info')) {
        const producto = carrito[e.target.dataset.id]
        producto.cantidad++
        carrito[e.target.dataset.id]={...producto}
        pintarCarrito()
    }
    if (e.target.classList.contains('btn-danger')) {
        const producto = carrito[e.target.dataset.id]
        producto.cantidad--
        if (producto.cantidad === 0) {
            delete carrito[e.target.dataset.id]
        }
        pintarCarrito()
    }
}