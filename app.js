// ⚠️ Cambia esta URL por tu WebApp desplegado
const API_URL = "https://script.google.com/macros/s/AKfycbzupgpn4-mxotQARzds8GECXWc1WF47MAZcjQysZHIuFVp8cGHJag_6hU51eiCbQwHp5g/exec";

document.addEventListener("DOMContentLoaded", () => {
  const tareasDiv = document.getElementById("tareas");

  // === Obtener tareas ===
  fetch(API_URL)
    .then(res => res.json())
    .then(tareas => {
      tareasDiv.innerHTML = "";

      Object.keys(tareas).forEach(nombreTarea => {
        const { fechaFin } = tareas[nombreTarea];

        // Parsear fecha con hora (dd/MM/yyyy HH:mm)
        const partes = fechaFin.split(/[\/\s:]/); 
        const fechaFinObj = new Date(
          parseInt(partes[2]), // año
          parseInt(partes[1]) - 1, // mes
          parseInt(partes[0]), // día
          parseInt(partes[3] || 0), // hora
          parseInt(partes[4] || 0)  // minuto
        );

        // Crear tarjeta
        const tareaEl = document.createElement("div");
        tareaEl.classList.add("tarea");
        tareaEl.innerHTML = `
          <strong>${nombreTarea}</strong>
          <div class="fecha">Fecha fin: ${fechaFin}</div>
          <div class="contador">Calculando...</div>
          <form class="formRegistro" style="display:none">
            <input type="text" name="nombre" placeholder="Tu nombre" required>
            <button type="submit">Concluir</button>
          </form>
          <p class="estado"></p>
        `;

        tareasDiv.appendChild(tareaEl);

        const contadorEl = tareaEl.querySelector(".contador");
        const form = tareaEl.querySelector(".formRegistro");
        const estado = tareaEl.querySelector(".estado");

        // === Función para actualizar contador dinámico ===
        const actualizarContador = () => {
          const ahora = new Date();
          const diffMs = fechaFinObj - ahora;
          const diffMin = Math.floor(diffMs / (1000 * 60));

          if (diffMin > 0) {
            const dias = Math.floor(diffMin / (60 * 24));
            const horas = Math.floor((diffMin % (60 * 24)) / 60);
            const minutos = diffMin % 60;

            let texto = "Faltan ";
            if (dias > 0) texto += `${dias}d `;
            if (horas > 0 || dias > 0) texto += `${horas}h `;
            texto += `${minutos}m`;

            contadorEl.textContent = texto;
          } else {
            contadorEl.textContent = "¡Es hora!";
            form.style.display = "block"; // 👈 aparece automáticamente
          }
        };

        // Ejecutar al cargar
        actualizarContador();

        // Actualizar cada minuto
        setInterval(actualizarContador, 60000);

        // === Registrar tarea finalizada ===
        form.addEventListener("submit", e => {
          e.preventDefault();
          estado.textContent = "Enviando...";

          const nombre = form.querySelector("input").value;
          const fecha = new Date().toISOString();

          fetch(API_URL, {
            method: "POST",
            body: new URLSearchParams({ nombre, tarea: nombreTarea, fecha })
          })
            .then(res => res.json())
            .then(data => {
              if (data.ok) {
                estado.textContent = "✅ Tarea registrada.";
                setTimeout(() => {
                  location.reload(); // 👈 refrescar después de enviar
                }, 1500);
              } else {
                estado.textContent = "❌ Error: " + data.error;
              }
            })
            .catch(() => {
              estado.textContent = "❌ Error de conexión.";
            });
        });
      });
    })
    .catch(err => {
      console.error(err);
      tareasDiv.innerHTML = "Error cargando tareas.";
    });
});
