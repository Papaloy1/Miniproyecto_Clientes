import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://udlojvvgmcywscznhuxh.supabase.co/rest/v1/clientes'
const supabaseKey = 'sb_publishable_IYHHqDw8vpeq3vA2_gvgww_CEtx2LgW'
const supabase = createClient(supabaseUrl, supabaseKey)

// ELEMENTOS DEL DOM
const inputClave = document.getElementById("clave");
const inputNombre = document.getElementById("nombre");
const inputEdad = document.getElementById("edad");
const inputFecha = document.getElementById("fecha_nacimiento");

const btnNuevo = document.getElementById("btnNuevo");
const btnGuardar = document.getElementById("btnGuardar");
const btnEliminar = document.getElementById("btnEliminar");
const tablaBody = document.getElementById("tablaBody");

// EVENTOS INICIALES Y BOTONES
document.addEventListener("DOMContentLoaded", cargarGrid);
btnNuevo.addEventListener("click", limpiarPantalla);
btnGuardar.addEventListener("click", guardarCliente);
btnEliminar.addEventListener("click", eliminarCliente);
inputClave.addEventListener("blur", buscarPorClave);

// 1. CARGAR DATOS EN EL GRID (READ)
async function cargarGrid() {
    const { data, error } = await supabase
        .from("clientes")
        .select("clave, nombre, edad, fecha_nacimiento")
        .order("clave", { ascending: true });

    if (error) {
        console.error("Error al cargar datos:", error.message);
        return;
    }

    tablaBody.innerHTML = "";

    data.forEach((cliente) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${cliente.clave}</td>
            <td>${cliente.nombre || ''}</td>
        `;
        
        // Al dar clic a una fila, llena los campos superiores
        tr.addEventListener("click", () => {
            inputClave.value = cliente.clave;
            inputNombre.value = cliente.nombre || "";
            inputEdad.value = cliente.edad || "";
            inputFecha.value = cliente.fecha_nacimiento || "";
        });

        tablaBody.appendChild(tr);
    });
}

// 2. BUSCAR POR CLAVE AL SALIR DE LA CAJA DE TEXTO (BLUR)
async function buscarPorClave() {
    const claveVal = inputClave.value.trim();
    if (!claveVal) return;

    const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("clave", claveVal)
        .maybeSingle();

    if (error) {
        console.error("Error al buscar clave:", error.message);
        return;
    }

    if (data) {
        // Si existe, autonavega y llena los campos
        inputNombre.value = data.nombre || "";
        inputEdad.value = data.edad || "";
        inputFecha.value = data.fecha_nacimiento || "";
    } else {
        // Si no existe, permite continuar la captura sin borrar la clave ingresada
        inputNombre.value = "";
        inputEdad.value = "";
        inputFecha.value = "";
    }
}

// 3. BOTÓN NUEVO (LIMPIAR PANTALLA)
function limpiarPantalla() {
    inputClave.value = "";
    inputNombre.value = "";
    inputEdad.value = "";
    inputFecha.value = "";
    inputClave.focus();
}

// 4. BOTÓN GUARDAR (INSERT / UPDATE - UPSERT)
async function guardarCliente() {
    const clave = inputClave.value.trim();
    const nombre = inputNombre.value.trim();
    const edad = inputEdad.value ? parseInt(inputEdad.value) : null;
    const fecha_nacimiento = inputFecha.value || null;

    if (!clave) {
        alert("Por favor ingrese la clave del cliente.");
        return;
    }

    // Método upsert: Inserta si la clave no existe, actualiza si ya existe[cite: 1]
    const { error } = await supabase
        .from("clientes")
        .upsert([{ clave, nombre, edad, fecha_nacimiento }], { onConflict: "clave" });

    if (error) {
        alert("Error al guardar: " + error.message);
    } else {
        alert("Registro guardado exitosamente.");
        cargarGrid(); // Refresca el Grid automáticamente[cite: 1]
    }
}

// 5. BOTÓN ELIMINAR (DELETE)[cite: 1]
async function eliminarCliente() {
    const clave = inputClave.value.trim();

    if (!clave) {
        alert("Seleccione o ingrese la clave del cliente que desea eliminar.");
        return;
    }

    // Confirmación mediante alert/confirm[cite: 1]
    const confirmacion = confirm(`¿Está seguro de que desea eliminar al cliente con clave "${clave}"?`);
    
    if (confirmacion) {
        const { error } = await supabase
            .from("clientes")
            .delete()
            .eq("clave", clave);

        if (error) {
            alert("Error al eliminar: " + error.message);
        } else {
            alert("Cliente eliminado correctamente.");
            limpiarPantalla(); // Limpia la pantalla[cite: 1]
            cargarGrid();      // Refresca el Grid[cite: 1]
        }
    }
}