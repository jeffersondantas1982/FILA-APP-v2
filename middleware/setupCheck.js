const fs = require('fs');
const path = require('path');

/**
 * Middleware para verificar se o sistema já foi configurado.
 * Se o arquivo .env não existir, redireciona todas as requisições (exceto rotas de instalação e assets) 
 * para a página de instalação.
 */
const setupCheck = (req, res, next) => {
    const envPath = path.join(__dirname, '..', '.env');
    const envExists = fs.existsSync(envPath);

    // Ignora assets estáticos, rotas de setup e a própria tela de instalação
    const isStaticAsset = /\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i.test(req.path);
    const isSetupRoute = req.path.startsWith('/api/setup') || req.path === '/install.html' || req.path === '/manual_implantacao.html';

    // Se o .env não existe e NÃO é uma rota de setup/asset, REDIRECIONA
    if (!envExists && !isSetupRoute && !isStaticAsset) {
        // Redireciona apenas se for uma navegação de página (não API ou asset não capturado pelo regex)
        // Se for API (não de setup), retornamos um erro claro
        if (req.path.startsWith('/api/')) {
            return res.status(503).json({
                error: 'Sistema não configurado',
                message: 'Por favor, complete a instalação em /install.html'
            });
        }

        console.log(`\x1b[33m[SetupCheck]\x1b[0m Redirecionando \x1b[36m${req.path}\x1b[0m -> \x1b[32m/install.html\x1b[0m`);
        return res.redirect('/install.html');
    }

    next();
};

module.exports = setupCheck;
