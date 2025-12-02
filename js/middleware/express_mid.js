const { body, query, param, validationResult } = require('express-validator');



// Middleware genérico para tratar erros de validação
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("❌ Erros de validação no login:", errors.array()[0].msg);
        return res.status(400).json({
            success: false,
            message: 'Erro de validação',
            errors: errors.array()
        });
    }
    next();
};

// Esquemas de validação reutilizáveis
const validationSchemas = {
    loginValidation: [
        body('user')
        .notEmpty().withMessage('Usuário é obrigatório')
        .isString().withMessage('Usuário deve ser uma string'),
        body('password')
        .notEmpty().withMessage('Senha é obrigatória')
        .isString().withMessage('Senha deve ser uma string'),
    ],
    buscarFiltro: [
        body('tabela')
            .notEmpty().withMessage('Tabela é obrigatória')
            .isString().withMessage('Tabela deve ser uma string'),
        body('coluna')
            .notEmpty().withMessage('Coluna é obrigatória')
            .isString().withMessage('Coluna deve ser uma string'),
        body('valor')
            .notEmpty().withMessage('Valor é obrigatório'),
        body('qtdLimite')
            .optional()
            .isInt({ min: 1 }).withMessage('qtdLimite deve ser um número inteiro positivo'),
        body('orderBy')
            .optional()
            .isBoolean().withMessage('orderBy deve ser um booleano')
    ],

    solicitacoesRecentes: [
        body('valor')
            .isInt({ min: 1, max: 100 }).withMessage('Valor deve ser um número entre 1 e 100')
    ],

    changeLibDev: [
        body('dataTemp')
            .notEmpty().withMessage('dataTemp é obrigatório'),
        body('id')
            .isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo')
    ],

    enviarOrcamento: [
        body('solicitante')
            .notEmpty().withMessage('Solicitante é obrigatório')
            .isLength({ min: 2, max: 100 }).withMessage('Solicitante deve ter entre 2 e 100 caracteres'),
        body('cidade')
            .notEmpty().withMessage('Cidade é obrigatória'),
        body('materiais')
            .isArray({ min: 1 }).withMessage('Materiais deve ser um array com pelo menos um item'),
        body('projeto')
            .notEmpty().withMessage('Projeto é obrigatório'),
        body('tensao')
            .notEmpty().withMessage('Tensão é obrigatória'),
        body('equipe')
            .notEmpty().withMessage('Equipe é obrigatória'),
        body('tipo')
            .notEmpty().withMessage('Tipo é obrigatório'),
        body('listaNomes')
            .isArray().withMessage('Lista de nomes deve ser um array'),
        body('tel')
            .optional()
            .isMobilePhone('pt-BR').withMessage('Telefone deve ser um número válido')
    ]
};

module.exports = {
    handleValidationErrors,
    validationSchemas
};