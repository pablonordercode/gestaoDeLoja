const router = require("express").Router();

const { adicionarProduto, buscarTodosProdutos, buscarProdutoId, editarProduto, deletarProduto } = require("../controllers/produtoControl");

//middlewares
const { imageUpload } = require("../middlewares/imagemUPL");
const { verificarAuth } = require("../middlewares/authMiddleware");

// Rotas protegidas - requerem autenticação
router.post("/addProduto", verificarAuth, imageUpload.single("imagem"), adicionarProduto);
router.get("/todosProdutos", verificarAuth, buscarTodosProdutos);
router.get("/produto/:id", verificarAuth, buscarProdutoId);
router.put("/editarProduto/:id", verificarAuth, imageUpload.single("imagem"), editarProduto);
router.delete("/deletarProduto/:id", verificarAuth, deletarProduto);

module.exports = router;