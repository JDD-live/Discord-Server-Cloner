const { Client } = require("discord.js-selfbot-v13");
const colors = require("colors");
const readlineSync = require("readline-sync");

const printHeader = () => {
  const art = `
    
████████╗██╗  ██╗███████╗     ██████╗  ██████╗ ██████╗ ███████╗
╚══██╔══╝██║  ██║██╔════╝    ██╔════╝ ██╔═══██╗██╔══██╗██╔════╝
   ██║   ███████║█████╗      ██║  ███╗██║   ██║██║  ██║███████╗
   ██║   ██╔══██║██╔══╝      ██║   ██║██║   ██║██║  ██║╚════██║
   ██║   ██║  ██║███████╗    ╚██████╔╝╚██████╔╝██████╔╝███████║
   ╚═╝   ╚═╝  ╚═╝╚══════╝     ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝
                                                               

    `.cyan;

  const credits =
    `\n    Feito por JD | Créditos: https://discord.gg/DqRQHyMM9f\n`.white;

  console.log(art);
  console.log(credits);
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const translatePermissions = (originChannel, roleMap) => {
  return originChannel.permissionOverwrites.cache
    .map((overwrite) => {
      const newRole = roleMap.get(overwrite.id);
      const permissionData = {
        id: newRole ? newRole.id : overwrite.id,
        allow: overwrite.allow.toArray(),
        deny: overwrite.deny.toArray(),
      };
      return permissionData;
    })
    .filter((p) => p);
};

const cloneServer = async (originGuild, targetGuild) => {
  try {
    console.log(
      `\n[INFO] Iniciando limpeza do servidor de destino: ${targetGuild.name}...`
        .blue
    );
    for (const channel of targetGuild.channels.cache.values()) {
      try {
        await channel.delete();
        await delay(250);
      } catch (e) {}
    }
    for (const role of targetGuild.roles.cache.values()) {
      if (role.id !== targetGuild.id && !role.managed) {
        try {
          await role.delete();
          await delay(250);
        } catch (e) {}
      }
    }
    console.log("[SUCCESS] Limpeza concluída.".green);

    console.log("\n[INFO] Clonando cargos...".blue);
    const roleMap = new Map();
    const originRoles = [...originGuild.roles.cache.values()].sort(
      (a, b) => a.position - b.position
    );

    for (const sourceRole of originRoles) {
      if (sourceRole.id === originGuild.id) {
        roleMap.set(sourceRole.id, targetGuild.roles.everyone);
        continue;
      }
      try {
        const newRole = await targetGuild.roles.create({
          name: sourceRole.name,
          color: sourceRole.color,
          hoist: sourceRole.hoist,
          permissions: sourceRole.permissions,
          mentionable: sourceRole.mentionable,
          position: sourceRole.position,
        });
        roleMap.set(sourceRole.id, newRole);
        await delay(500);
      } catch (error) {
        console.error(
          `[FAIL] Falha ao clonar cargo '${sourceRole.name}': ${error.message}`
            .red
        );
      }
    }
    console.log("[SUCCESS] Cargos clonados.".green);

    console.log("\n[INFO] Clonando canais e categorias...".blue);
    const originChannels = [...originGuild.channels.cache.values()].sort(
      (a, b) => a.position - b.position
    );
    const categoryMap = new Map();

    for (const originChannel of originChannels.filter(
      (c) => c.type === "GUILD_CATEGORY"
    )) {
      try {
        const newCategory = await targetGuild.channels.create(
          originChannel.name,
          {
            type: "GUILD_CATEGORY",
            position: originChannel.position,
            permissionOverwrites: translatePermissions(originChannel, roleMap),
          }
        );
        categoryMap.set(originChannel.id, newCategory);
        await delay(500);
      } catch (error) {
        console.error(
          `[FAIL] Falha ao clonar categoria '${originChannel.name}': ${error.message}`
            .red
        );
      }
    }

    for (const originChannel of originChannels.filter(
      (c) => c.type !== "GUILD_CATEGORY"
    )) {
      try {
        await targetGuild.channels.create(originChannel.name, {
          type: originChannel.type,
          topic: originChannel.topic,
          nsfw: originChannel.nsfw,
          parent: originChannel.parentId
            ? categoryMap.get(originChannel.parentId)
            : null,
          position: originChannel.position,
          permissionOverwrites: translatePermissions(originChannel, roleMap),
          userLimit: originChannel.userLimit,
          bitrate: originChannel.bitrate,
        });
        await delay(500);
      } catch (error) {
        console.error(
          `[FAIL] Falha ao clonar canal '${originChannel.name}': ${error.message}`
            .red
        );
      }
    }
    console.log("[SUCCESS] Canais clonados.".green);
  } catch (error) {
    console.error(
      "\n[FATAL] Um erro crítico ocorreu durante a clonagem:".red,
      error
    );
    return false;
  }
  return true;
};

const main = async () => {
  console.clear();
  printHeader();

  const token = readlineSync.question(
    "Insira seu token do Discord e pressione Enter: (Sem aspas) ".yellow,
    {
      hideEchoBack: true,
    }
  );

  if (!token) {
    console.error("\n[FATAL] Nenhum token foi fornecido. Encerrando.".red);
    return;
  }

  const client = new Client({ checkUpdate: false });

  client.on("ready", async () => {
    try {
      console.log(
        `\n[SUCCESS] Login bem-sucedido como ${client.user.tag}`.green
      );
      console.log("--------------------------------------------------".gray);

      const originGuildId = readlineSync.question(
        "Insira o ID do servidor a ser clonado (ORIGEM): ".yellow
      );
      const targetGuildId = readlineSync.question(
        "Insira o ID do servidor de destino (CÓPIA): ".yellow
      );

      if (!originGuildId || !targetGuildId) {
        throw new Error("Os IDs dos servidores não podem ser vazios.");
      }

      console.log("\n[INFO] Buscando servidores...".blue);
      const originGuild = await client.guilds.fetch(originGuildId);
      const targetGuild = await client.guilds.fetch(targetGuildId);
      console.log(
        `[SUCCESS] Servidores encontrados: ${originGuild.name} -> ${targetGuild.name}`
          .green
      );

      const success = await cloneServer(originGuild, targetGuild);

      console.log("--------------------------------------------------".gray);
      if (success) {
        console.log(
          "✅ PROCESSO DE CLONAGEM CONCLUÍDO COM SUCESSO! ✅".bgGreen.black
        );
      } else {
        console.log(
          "❌ PROCESSO DE CLONAGEM FALHOU. Verifique os erros acima. ❌".bgRed
            .white
        );
      }
    } catch (error) {
      console.error("\n[FATAL] Não foi possível executar a operação.".red);
      console.error(
        "Verifique se os IDs dos servidores estão corretos e se sua conta está em ambos."
          .red
      );
    } finally {
      client.destroy();
    }
  });

  try {
    await client.login(token);
  } catch (error) {
    console.error(
      "\n[FATAL] Login falhou. O token fornecido é inválido ou a conexão falhou."
        .red
    );
  }
};

main();
