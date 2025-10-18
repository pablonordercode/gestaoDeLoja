const router = require("express").Router();

const { adicionarColaborador, 
        buscarColaboradores, 
        buscarColaboradorId, 
        editarColaborador,
        deletarColaborador, 
        loginColaborador,
        refreshToken,
        logoutColaborador } = require("../controllers/colaboradorControl");

//middlewares
const { imageUpload } = require("../middlewares/imagemUPL");
const { verificarAuth, verificarAdmin } = require("../middlewares/authMiddleware");

// Rotas públicas
router.post("/login", loginColaborador);
router.post("/refresh-token", refreshToken);
router.post("/addColaborador", imageUpload.single("imagem"), adicionarColaborador);

// Rotas protegidas - requerem autenticação
router.post("/logout", verificarAuth, logoutColaborador);
router.get("/todosColaboradores", verificarAuth, verificarAdmin, buscarColaboradores);
router.get("/oneColaborador/:id", verificarAuth, buscarColaboradorId);
router.put("/editarColaborador/:id", verificarAuth, verificarAdmin, imageUpload.single("imagem"), editarColaborador);
router.delete("/deletarColaborador/:id", verificarAuth, verificarAdmin, deletarColaborador);

module.exports = router;