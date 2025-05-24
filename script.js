let datos = [];

function cargarRequerimientos() {
  const guardado = localStorage.getItem("datos");

  // Se valida si hay datos previamente cargados, esto dado que estamos trabajando sin backend.
  if (guardado) {
    datos = JSON.parse(guardado);
    mostrarTabla(datos);
  } else {
    fetch("data.json")
      .then(res => res.json())
      .then(data => {
        datos = data;
        localStorage.setItem("datos", JSON.stringify(data)); // Se almacenan los datos en el local storage
        mostrarTabla(data);
      });
  }

}

function mostrarTabla(lista) {
  const tbody = document.getElementById("tabla-datos");
  if (!tbody) return;
  tbody.innerHTML = "";
  lista.forEach((item, i) => {
    // Voy a usar emojis para indicar si está activo o no, para el botón editar y para el activar / inactivar
    tbody.innerHTML += `
      <tr>
        <td>${item.id}</td>
        <td>${item.tipoBien}</td>
        <td>${item.unidad}</td>
        <td>${item.cantidad}</td>
        <td>${item.valorTotal}</td>
        <td>${item.activo ? "✅" : "❌"}</td> 
        <td><button onclick="editar(${item.id})" title="Editar registro">✏️</button>
        <button onclick="activarInactivarRequerimiento(${item.id})" title="${item.activo ? 'Desactivar' : 'Activar'}"> ${item.activo ? '🛑' : '✅'}
  </button></td>
      </tr>
    `;
  });
}

function filtrarRequerimientos() {
  const filtro = document.getElementById("filter").value.toLowerCase();
  const filtrado = datos.filter(item => {
    return Object.values(item).some(valor =>
      String(valor).toLowerCase().includes(filtro)
    );
  });
  mostrarTabla(filtrado);
}

function editar(id) {
  let item = {};
  item.presupuesto = 0;
  item.tipoBien = "";
  item.unidad = "";
  item.cantidad = 0;
  item.valorUnitario = 0;
  item.valorTotal = 0;
  item.fechaAdquisicion = new Date().toISOString().split('T')[0];
  item.proveedor = "";
  item.activo = true;
  if (id > 0) {
    item = datos.find(d => d.id === id);
  }
  localStorage.setItem("registro", JSON.stringify(item));
  window.location.href = "edit.html";
}

function calcularValorTotal() {
  const cantidad = parseFloat(document.getElementById("edit-cantidad").value) || 0;
  const valorUnitario = parseFloat(document.getElementById("edit-valorUnitario").value) || 0;
  const resultado = cantidad * valorUnitario;
  document.getElementById("edit-valorTotal").value = resultado;
}

function actualizarRequerimiento() {
  const form = document.getElementById("edit-form");

  // Se agrega validación automática de HTML5 con base en los parámetros que se establecieron en los campos del formuulario
  if (!form.checkValidity()) {
    form.reportValidity();
    return false;
  }

  const datos = JSON.parse(localStorage.getItem('datos'));

  const registro = JSON.parse(localStorage.getItem("registro"));
  const presupuesto = document.getElementById("edit-presupuesto").value;
  const unidad = document.getElementById("edit-unidad").value;
  const tipoBien = document.getElementById("edit-tipoBien").value;
  const cantidad = document.getElementById("edit-cantidad").value;
  const valorUnitario = document.getElementById("edit-valorUnitario").value;
  const valorTotal = document.getElementById("edit-valorTotal").value;
  const fechaAdquisicion = document.getElementById("edit-fechaAdquisicion").value;
  const proveedor = document.getElementById("edit-proveedor").value;
  //const activo = document.getElementById("edit-activo").checked;

  const item = datos.find(d => d.id == registro.id);
  console.log('item', item);
  // Si encuentra el item, ya existe, por tanto edita
  if (item) {
    item.presupuesto = parseInt(presupuesto);
    item.tipoBien = tipoBien;
    item.unidad = unidad;
    item.cantidad = parseInt(cantidad);
    item.valorUnitario = parseInt(valorUnitario);
    item.valorTotal = parseInt(valorTotal);
    item.fechaAdquisicion = fechaAdquisicion;
    item.proveedor = proveedor;

    // Vamos a almacenar el histórico en la propiedad "histórico", si no existe la crea como un array vacío.
    if (!Array.isArray(item.historico)) {
      item.historico = [];
    }

    // Vamos a almacenar en el histórico el valor original (antes de la modificación) y le vamos a agregar el campo "fechaModificacion" para que sepamos cuándo fue que lo cambiaron
    registro.fechaModificacion = new Date().toISOString().split('T')[0];

    // Se inserta el registro histórico con la fecha de cambio
    item.historico.push(registro);

    localStorage.setItem("datos", JSON.stringify(datos));

    alert("Registro actualizado");
    window.location.href = "index.html";
  }
  else { // Si no existe, lo crea

    // Como no está conectado a ninguna llave primaria ni autogenerada, voy a generar el id con base en el máximo que existe previamente en datos
    const nuevoId = Math.max(...datos.map(d => d.id), 0) + 1;
    const itemNuevo = {
      "activo": true,
      "id": nuevoId,
      presupuesto,
      tipoBien,
      unidad,
      "cantidad": parseInt(cantidad),
      "valorUnitario": parseInt(valorUnitario),
      "valorTotal": parseInt(valorTotal),
      fechaAdquisicion,
      proveedor
    };
    datos.push(itemNuevo);
    localStorage.setItem("datos", JSON.stringify(datos)); // Se almacenan los datos con el nuevo registro en el  localstorage
    alert("Registro Creado");
    window.location.href = "index.html";
  }
  return false;
}

function activarInactivarRequerimiento(id) {
  const item = datos.find(d => d.id === id);
  const registro = JSON.parse(JSON.stringify(item)); // Crea una copia del item original para evitar entrar en inconsistencia
  if (item) {
    item.activo = !item.activo; // Cambia el estado de activo a inactivo o al contrario

    // Vamos a almacenar el histórico en la propiedad "histórico", si no existe la crea como un array vacío.
    if (!Array.isArray(item.historico)) {
      item.historico = [];
    }

    // Vamos a almacenar en el histórico el valor original (antes de la modificación) y le vamos a agregar el campo "fechaModificacion" para que sepamos cuándo fue que lo cambiaron
    registro.fechaModificacion = new Date().toISOString().split('T')[0];

    // Se inserta el registro histórico con la fecha de cambio
    item.historico.push(registro);

    localStorage.setItem("datos", JSON.stringify(datos)); // Actualizar el storage
    mostrarTabla(datos); // Actualiza la visualización
  }
}


/*
De acuerdo al requerimiento, se implementa esta función con el objeto de retorna los elementos con información relevante.
Asumí para el ejercicio que los datos relevantes son la Unidad, el tipo de bien y el valor total del requerimiento de adquisición
*/
function listarRequerimientosConInfoRelevante() {
  const requerimientos = localStorage.getItem("datos");
  if (!requerimientos) return [];

  const datos = JSON.parse(requerimientos);

  return datos.map(item => ({
    id: item.id,
    unidad: item.unidad,
    tipoBien: item.tipoBien,
    valorTotal: item.valorTotal
  }));
}

window.onload = () => {
  if (location.pathname.endsWith("index.html") || location.pathname === "/") {
    cargarRequerimientos();
  } else if (location.pathname.endsWith("edit.html")) {
    const registro = JSON.parse(localStorage.getItem("registro"));
    if (registro) {
      document.getElementById("edit-presupuesto").value = registro.presupuesto;
      document.getElementById("edit-unidad").value = registro.unidad;
      document.getElementById("edit-tipoBien").value = registro.tipoBien;
      document.getElementById("edit-cantidad").value = registro.cantidad;
      document.getElementById("edit-valorUnitario").value = registro.valorUnitario;
      document.getElementById("edit-valorTotal").value = registro.valorTotal;
      document.getElementById("edit-fechaAdquisicion").value = registro.fechaAdquisicion;
      document.getElementById("edit-proveedor").value = registro.proveedor;
      //document.getElementById("edit-activo").checked = registro.activo;

    }
  }
};
