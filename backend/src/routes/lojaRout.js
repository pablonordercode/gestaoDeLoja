const router = require("express").Router();

const { 
    criarLoja, 
    buscarLoja, 
    atualizarLoja,
    deletarLoja 
} = require("../controllers/lojaControl");

// Middlewares
const { imageUpload } = require("../middlewares/imagemUPL");
const { verificarAuth, verificarAdmin } = require("../middlewares/authMiddleware");

// Rotas públicas (qualquer usuário autenticado pode ver)
router.get("/", verificarAuth, buscarLoja);

// Rotas protegidas - apenas Gerente/Administrador
router.post("/", verificarAuth, verificarAdmin, imageUpload.single("logo"), criarLoja);
router.put("/:id", verificarAuth, verificarAdmin, imageUpload.single("logo"), atualizarLoja);
router.delete("/:id", verificarAuth, verificarAdmin, deletarLoja);

module.exports = router;


