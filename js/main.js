// Cargar el carrito desde localStorage de manera segura
let carrito = [];
try {
  carrito = JSON.parse(localStorage.getItem("carrito")) || [];
} catch (e) {
  console.error("Error al leer el carrito desde localStorage", e);
}

// Función para cargar productos desde un archivo JSON
const cargarProductos = async () => {
  try {
    const response = await fetch("productos.json"); // Carga el archivo JSON
    if (!response.ok) {
      throw new Error("No se pudo cargar el archivo JSON");
    }
    const productos = await response.json(); // Convierte la respuesta en JSON
    renderProductos(productos); // Renderiza los productos en el DOM
  } catch (e) {
    console.error("Error al cargar los productos:", e);
  }
};

// Función para calcular el total y la cantidad de productos en el carrito
const calcularTotales = () => {
  return carrito.reduce(
    (acc, prod) => {
      acc.total += prod.precio * prod.cantidad; // Suma el total del producto (precio * cantidad)
      acc.cantidad += prod.cantidad; // Suma la cantidad total de productos
      return acc;
    },
    { total: 0, cantidad: 0 } // Inicializa los totales
  );
};

// Abrir y cerrar el carrito al hacer clic en el icono
document.getElementById("carritoIcon").addEventListener("click", () => {
  document.getElementById("carrito").classList.toggle("active"); // Cambia la visibilidad del carrito
});

// Detectar clic fuera del carrito para cerrarlo
document.addEventListener("click", (event) => {
  const carritoElement = document.getElementById("carrito");
  const carritoIconElement = document.getElementById("carritoIcon");

  if (
    !carritoElement.contains(event.target) &&
    !carritoIconElement.contains(event.target)
  ) {
    carritoElement.classList.remove("active");
  }
});

// Renderizar los productos en el DOM
const renderProductos = (productos) => {
  const productosContainer = document.getElementById("productos");
  productosContainer.innerHTML = productos
    .map(
      (prod) => `
        <div class="producto">
            <h3>${prod.nombre}</h3>
            <img src="${prod.imagen}" alt="${prod.nombre}">
            <p>Precio: $${prod.precio}</p>
            <p>${prod.desc}</p>
            <button class="btn-agregar" data-id="${prod.id}" aria-label="Agregar al carrito">Agregar</button>
        </div>`
    )
    .join("");

  // Delegación de eventos para los botones "Agregar"
  productosContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-agregar")) {
      agregarAlCarrito(e, productos);
    }
  });
};

// Agregar productos al carrito
const agregarAlCarrito = (e, productos) => {
  const id = +e.target.dataset.id;
  const prod = productos.find((p) => p.id === id);
  const prodCarrito = carrito.find((p) => p.id === id);

  if (prodCarrito) {
    prodCarrito.cantidad++;
  } else {
    carrito.push({ ...prod, cantidad: 1 });
  }
  actualizarCarrito();

  Swal.fire({
    title: "Producto agregado",
    text: `${prod.nombre} fue añadido al carrito`,
    icon: "success",
    timer: 1500,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
  });
};

// Actualizar el carrito en el DOM
const actualizarCarrito = () => {
  const carritoContainer = document.getElementById("productosCarrito");
  carritoContainer.innerHTML = carrito
    .map(
      (prod) => `
        <div class="producto">
            <h3>${prod.nombre}</h3>
            <p>Precio: $${prod.precio}</p>
            <p>Cantidad: ${prod.cantidad}</p>
            <button class="btn-quitar" data-id="${prod.id}" aria-label="Quitar del carrito">Quitar</button>
        </div>`
    )
    .join("");

  const { total, cantidad } = calcularTotales();
  document.getElementById("total").textContent = "$" + total;
  document.getElementById("contadorCarrito").textContent = cantidad;

  localStorage.setItem("carrito", JSON.stringify(carrito));
};

// Eliminar un producto del carrito
const quitarDelCarrito = (e) => {
  const id = +e.target.dataset.id;
  const index = carrito.findIndex((p) => p.id === id);
  if (index > -1) {
    if (carrito[index].cantidad === 1) {
      carrito.splice(index, 1);
    } else {
      carrito[index].cantidad--;
    }
    actualizarCarrito();
  }
};

// Borrar todo el carrito
const borrarTodo = () => {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "Se eliminarán todos los productos del carrito.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, borrar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      carrito.length = 0;
      actualizarCarrito();
      Swal.fire(
        "Carrito vacío",
        "Todos los productos fueron eliminados",
        "success"
      );
    }
  });
};

// Finalizar compra
document.getElementById("finalizarCompra").addEventListener("click", () => {
  if (carrito.length === 0) {
    Swal.fire({
      icon: "error",
      title: "Carrito vacío",
      text: "Debes agregar al menos un producto al carrito antes de finalizar la compra.",
    });
    return;
  }

  const resumen = carrito
    .map(
      (prod) =>
        `${prod.nombre} (Cantidad: ${prod.cantidad}) - Total: $${
          prod.precio * prod.cantidad
        }`
    )
    .join("\n");

  const { total } = calcularTotales();

  Swal.fire({
    title: "Resumen de compra",
    text: `Total a pagar: $${total}`,
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Confirmar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "¡Gracias por tu compra!",
        text: "Tu pedido será procesado.",
        icon: "success",
      });
      localStorage.removeItem("carrito");
      carrito.length = 0;
      actualizarCarrito();
    }
  });
});

// Delegar eventos al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  cargarProductos(); // Carga y renderiza los productos
  actualizarCarrito();
  document.getElementById("borrarTodo").addEventListener("click", borrarTodo);
  document.getElementById("productosCarrito").addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-quitar")) {
      quitarDelCarrito(e);
    }
  });
});
