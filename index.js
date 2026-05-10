const express = require("express");
const os = require("os");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = 3002;

// ==================== MIDDLEWARE ====================

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// ==================== SUPABASE ====================

const supabase = createClient(
  "https://pxglwwuxozbesamxabvb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4Z2x3d3V4b3piZXNhbXhhYnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMTYwOTMsImV4cCI6MjA5MTg5MjA5M30.3mgOgXZw09l3g3RyGb-fuhoBd4GPNm0Ka5VLBkuN9bM"
);

// ==================== RUTAS ====================

// Ruta principal
app.get("/", (req, res) => {
  res.json({
    message: "API funcionando 🚀",
    server: os.hostname()
  });
});

// Estado del servidor
app.get("/status", (req, res) => {
  res.json({
    status: "OK",
    server: os.hostname(),
    timestamp: new Date().toISOString()
  });
});

// ==================== CRUD NOTES ====================

// Crear nota
app.post("/notes", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({
        error: "El campo 'text' es obligatorio"
      });
    }

    const { data, error } = await supabase
      .from("Notes")
      .insert([
        {
          text: text.trim()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Error Supabase:", error);

      return res.status(500).json({
        error: error.message,
        details: error.details || error.hint || null
      });
    }

    res.status(201).json({
      message: "Nota creada exitosamente",
      server: os.hostname(),
      note: data
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});

// Obtener todas las notas
app.get("/notes", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al obtener notas:", error);

      return res.status(500).json({
        error: error.message
      });
    }

    res.json({
      server: os.hostname(),
      count: data.length,
      notes: data
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});

// Obtener nota por ID
app.get("/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("Notes")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        error: "Nota no encontrada"
      });
    }

    res.json({
      server: os.hostname(),
      note: data
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});

// Actualizar nota
app.put("/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({
        error: "El campo 'text' es obligatorio"
      });
    }

    const { data, error } = await supabase
      .from("Notes")
      .update({
        text: text.trim()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        error: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        error: "Nota no encontrada"
      });
    }

    res.json({
      message: "Nota actualizada exitosamente",
      server: os.hostname(),
      note: data
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});

// Eliminar nota
app.delete("/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("Notes")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(500).json({
        error: error.message
      });
    }

    res.json({
      message: "Nota eliminada exitosamente",
      server: os.hostname()
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});

// ==================== INICIAR SERVIDOR ====================

app.listen(PORT, () => {
  console.log(`Servidor ${os.hostname()} corriendo en puerto ${PORT}`);
});