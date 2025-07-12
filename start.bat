@echo off
title Clonador de Servidor - The Gods
cls

rem 
echo Verificando a instalacao do Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERRO FATAL] Node.js nao foi encontrado no seu sistema.
    echo O Node.js e essencial para que este programa funcione.
    echo.
    set /p choice="Deseja ser redirecionado para o site oficial de download do Node.js agora? (S/N): "
    if /i "%choice%"=="S" (
        echo Abrindo o navegador no site de download...
        start https://nodejs.org/en/download
    ) else (
        echo.
        echo Entendido. Por favor, instale o Node.js manualmente e execute este script novamente.
    )
    goto EndScript
)
echo Node.js encontrado! Continuando com a configuracao...
echo.

rem
if not exist "package.json" (
    echo [AVISO] O arquivo 'package.json' nao foi encontrado. Criando automaticamente...
    call npm init -y > nul 2>&1
    if errorlevel 1 (
        echo.
        echo [ERRO FATAL] Nao foi possivel criar o 'package.json'.
        goto EndScript
    )
    echo 'package.json' criado com sucesso.
    echo.
)

rem
if not exist "node_modules\discord.js-selfbot-v13" (
    echo [AVISO] As dependencias principais nao foram encontradas.
    echo Instalando dependencias necessarias... Por favor, aguarde.
    echo.
    
    rem
    rem
    call npm install discord.js-selfbot-v13 colors readline-sync

    if errorlevel 1 (
        echo.
        echo [ERRO FATAL] A instalacao das dependencias falhou. Verifique os erros acima.
        goto EndScript
    )
    echo.
    echo Dependencias instaladas com sucesso!
)

rem 
echo.
echo --------------------------------------------------
echo Configuracao concluida. Iniciando o bot...
echo --------------------------------------------------
echo.
node .

:EndScript
echo.
echo --------------------------------------------------
echo O script foi encerrado.
echo Pressione qualquer tecla para fechar esta janela.
echo --------------------------------------------------
pause > nul