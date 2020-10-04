let DB;
// Campos del formulario
const mascotaInput = document.querySelector('#mascota');
const propietarioInput = document.querySelector('#propietario');
const telefonoInput = document.querySelector('#telefono');
const fechaInput = document.querySelector('#fecha');
const horaInput = document.querySelector('#hora');
const sintomasInput = document.querySelector('#sintomas');
// UI
const formulario = document.querySelector('#nueva-cita');
const contenedorCitas = document.querySelector('#citas'); // Lista!

const heading = document.querySelector('#administra');

let editando; // Variable que define el estado de editando (boolean).

window.onload = () => {
    eventListeners(); // Llama a la funcion de Events
    crearDB();
}

//Events
function eventListeners(){
    mascotaInput.addEventListener('input', datosCita);
    propietarioInput.addEventListener('input', datosCita);
    telefonoInput.addEventListener('input', datosCita);
    fechaInput.addEventListener('input', datosCita);
    horaInput.addEventListener('input', datosCita);
    sintomasInput.addEventListener('input', datosCita);

    formulario.addEventListener('submit', nuevaCita); // Aplica para ambos casos > Nueva Cita / Guardar Cambios
}

class Citas{

    constructor() {
        this.citas =[]; // Un array como propiedad de clase
    }
    // Agregar cita al array citas
    agregarCita(cita){
        this.citas = [...this.citas, cita];

        // console.log(this.citas);
    }
    // Devolver un array excluyendo el no deseado
    eliminarCita(id){
        this.citas = this.citas.filter(cita => cita.id !== id )
    }
    // Devolver un array modificado sustituyendo la correspondiente
    editarCita(citaActualizada) {
        this.citas = this.citas.map( cita => cita.id === citaActualizada.id ? citaActualizada : cita );
    }
}

class UI{ 

    constructor() {
        this.textoHeading(citas);
    }
    // Mensajes
    imprimirAlerta(mensaje, tipo){
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert', 'd-block', 'col-12', 'p-2');

        if(tipo === 'error'){
            divMensaje.classList.add('alert-danger');
        }else{
            divMensaje.classList.add('alert-success');
        }

        divMensaje.textContent = mensaje;

        document.querySelector('#contenido').insertBefore(divMensaje, document.querySelector('.agregar-cita'))

        setTimeout(() => {
            divMensaje.remove();
        }, 3456);
    }
        
    // Mostrar lista de citas
    imprimirCitas(){ // Destructuring const {citas} = citas .Ten en cuenta que el otro es una arg de la instancia de Citas
        // Está accediendo al arreglo citas desde la instancia de Citas
        this.limpiarHTML();

        this.textoHeading(citas);

        const objectStore = DB.transaction('citas').objectStore('citas');

        const fnTextHeading = this.textoHeading;
        // console.log(e.target.result);
        const total = objectStore.count();
        
        total.onsuccess = function(){
            // console.log(total.result);
            fnTextHeading(total.result);
        }
        
        
        objectStore.openCursor().onsuccess = function(e){

            const cursor = e.target.result;
            
            if(cursor){
                const {mascota, propietario, telefono, fecha, hora, sintomas, id} = cursor.value;

                const divCita = document.createElement('div');
                divCita.classList.add('cita', 'p-3');
                divCita.dataset.id = id;

                const mascotaParrafo = document.createElement('h2');
                mascotaParrafo.classList.add('card-title', 'font-weight-bolder')
                mascotaParrafo.textContent = mascota;

                const propietarioParrafo = document.createElement('p');
                propietarioParrafo.innerHTML = `
                    <span class="font-weight-bolder">Propietario: </span> ${propietario}
                `;

                const telefonoParrafo = document.createElement('p');
                telefonoParrafo.innerHTML = `
                    <span class="font-weight-bolder">Teléfono: </span> ${telefono}
                `;

                const fechaParrafo = document.createElement('p');
                fechaParrafo.innerHTML = `
                    <span class="font-weight-bolder">Fecha: </span> ${fecha}
                `;

                const horaParrafo = document.createElement('p');
                horaParrafo.innerHTML = `
                    <span class="font-weight-bolder">Hora: </span> ${hora}
                `;

                const SintomasParrafo = document.createElement('p');
                SintomasParrafo.innerHTML = `
                    <span class="font-weight-bolder">Sintomas: </span> ${sintomas}
                `;

                const btnEliminar = document.createElement('button');
                btnEliminar.classList.add('btn', 'btn-danger', 'mr-2');
                btnEliminar.innerHTML = 'Eliminar <svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
                btnEliminar.onclick = () => eliminarCita(id);

                const btnEditar = document.createElement('button');
                btnEditar.classList.add('btn', 'btn-info');
                btnEditar.innerHTML = 'Editar <svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>';
                const cita = cursor.value;
                btnEditar.onclick = () => cargarEdicion(cursor.value); 

                divCita.appendChild(mascotaParrafo);
                divCita.appendChild(propietarioParrafo);
                divCita.appendChild(telefonoParrafo);
                divCita.appendChild(fechaParrafo);
                divCita.appendChild(horaParrafo);
                divCita.appendChild(SintomasParrafo);
                divCita.appendChild(btnEliminar);
                divCita.appendChild(btnEditar);

                contenedorCitas.appendChild(divCita);

                cursor.continue(); // Pasa al siguiente elemento
            }
            
        }
    }

    textoHeading(resultado){
        if(resultado > 0) {
            heading.classList.remove('bg-danger')
            heading.classList.add('bg-info')
            heading.textContent = 'Administra tus citas'
        } else {
            heading.classList.remove('bg-info')
            heading.classList.add('bg-danger')
            heading.textContent = 'No hay citas, comienza creando una'
        }
    }

    // Limpiar el HTML de lista de citas 
    limpiarHTML() {
        while(contenedorCitas.firstChild) {
            contenedorCitas.removeChild(contenedorCitas.firstChild);
        }
    }
}

const ui = new UI(); // Instancia de UI
// const ui = new UI(administrarCitas)
const administrarCitas = new Citas(); // Instancia de Citas
// ui.mostrarCitas();

// Objeto con los datos de la cita
const citaObj = {
    mascota: '',
    propietario: '',
    telefono: '',
    fecha: '',
    hora: '',
    sintomas: ''
}

// Agrega los datos al objeto
function datosCita(e){
    citaObj[e.target.name] = e.target.value; // En funcion del event, selecciona el name y le asigna el valor(lo ingresado)

    // console.log(citaObj)
}

// Agrega una cita, ya sea directa o por modificación > Valida, agrega, limpia y muestra
function nuevaCita(e){
    e.preventDefault(); 
        
    const {mascota, propietario, telefono, fecha, hora, sintomas} = citaObj; 

    if(mascota === ''|| propietario === ''|| telefono === ''|| fecha === ''|| hora === ''|| sintomas === '') {

        ui.imprimirAlerta('Todos los campos son obligatorios', 'error');
        return;
    }

    if(editando) { // Si editando es true, estaría en modo edición
        
        administrarCitas.editarCita({...citaObj})// No pasa el objeto global, sino una copia de el
        
        const transaction = DB.transaction(['citas'], 'readwrite');
        const objectStore = transaction.objectStore('citas');

        objectStore.put(citaObj);

        transaction.oncomplete = () => {
            ui.imprimirAlerta('Editado correctamente'); // El tipo es indiferente.. 
            formulario.querySelector('button[type="submit"]').textContent = 'Crear Cita'; // vuelve a su valor normal
            editando = false;
        }

        transaction.onerror = () => {
            console.log('Hubo un error');
        }
        
    } else {

        citaObj.id = Date.now();
        administrarCitas.agregarCita({...citaObj}); // No pasa el objeto global, sino una copia de el 

        const transaction = DB.transaction(['citas'], 'readwrite'); // Insertar Registro en IndexedDB
        
        const objectStore = transaction.objectStore('citas'); // Habilitar el objectstore

        objectStore.add(citaObj); // Insertar en la BD

        transaction.oncomplete = function() {
        console.log('Cita agregada');
        ui.imprimirAlerta('Se agregó correctamente');
        }
    }
    
    reiniciarObjeto(); // Vacía el objeto!!

    formulario.reset(); // Limpia los input

    ui.imprimirCitas(); // Muestra la lista

}

// Reinicia el objeto
function reiniciarObjeto(){ 
    citaObj.mascota = '';
    citaObj.propietario = '';
    citaObj.telefono = '';
    citaObj.fecha = '';
    citaObj.hora = '';
    citaObj.sintomas = '';
}

// Excluye, mensaje y lista las citas
function eliminarCita(id){

    const transaction = DB.transaction(['citas'], 'readwrite');
    const objectStore = transaction.objectStore('citas');

    objectStore.delete(id);
    
    transaction.oncomplete = () => {
        console.log(`Cita ${id} eliminada.. `);
        ui.imprimirCitas();
    }

    transaction.onerror = () => {
        console.log('Hubo un error');
    }

    ui.imprimirAlerta('La cita se eliminó correctamente');
    ui.imprimirCitas();
}

// Vuelve a llenar el formulario y el objeto y entra a modo edición
function cargarEdicion(cita){
    const { mascota, propietario, telefono, fecha, hora, sintomas, id } = cita;

    mascotaInput.value = mascota;
    propietarioInput.value = propietario;
    telefonoInput.value = telefono;
    fechaInput.value = fecha;
    horaInput.value = hora;
    sintomasInput.value = sintomas;

    citaObj.mascota = mascota;
    citaObj.propietario = propietario;
    citaObj.telefono = telefono;
    citaObj.fecha = fecha;
    citaObj.hora = hora;
    citaObj.sintomas = sintomas;
    citaObj.id = id;

    formulario.querySelector('button[type="submit"]').textContent = 'Guardar Cambios';

    editando = true;
}

function crearDB(){
    const crearDB = window.indexedDB.open('citas', 1)

    crearDB.onerror = function(){
        console.log('Hubo un error');
    }

    crearDB.onsuccess = function(){
        console.log('DB Creada');

        DB = crearDB.result;
        console.log(DB);

        ui.imprimirCitas();
    }

    crearDB.onupgradeneeded = function(e){
        const db = e.target.result;

        const objectStore = db.createObjectStore('citas', {
            keyPath: 'id',
            autoIncrement: true,
        })

        objectStore.createIndex('mascota', 'mascota', {unique: false});
        objectStore.createIndex('propietario', 'propietario', {unique: false});
        objectStore.createIndex('telefono', 'telefono', {unique: false});
        objectStore.createIndex('fecha', 'fecha', {unique: false});
        objectStore.createIndex('hora', 'hora', {unique: false});
        objectStore.createIndex('sintomas', 'sintomas', {unique: false});
        objectStore.createIndex('id', 'id', {unique: true});
    }

    console.log('DB Creada y lista');
}



