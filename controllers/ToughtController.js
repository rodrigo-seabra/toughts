const Tought = require("../models/Tought");
const User = require("../models/User");

//op = operador do sequelize
const { op, Op } = require("sequelize");

module.exports = class ToughtController {
  static async dashboard(req, res) {
    const userId = req.session.userId;

    //checando se o usuário existe
    const user = await User.findOne({
      where: { id: userId },
      include: Tought, //aqui temos os dados de pensamentos com os users juntos
      plain: true,
    }); //include traz os dados toughts relacionados com esse user
    //se o user não existe, mando ele para o login

    if (!user) {
      res.redirect("/login");
    }

    //manipulando dados para extrair os itens do array user que eu quero

    const toughts = user.Toughts.map((result) => result.dataValues); //excluindo as propriedades, definindo um array com apenas valores datavalues do array gerado no user

    //vendo se as tarefas estão vazias ou nao
    let emptyToughts = false;
    if (toughts.length === 0) {
      emptyToughts = true;
    }

    res.render("toughts/dashboard", { toughts, emptyToughts });
  }

  static async showToughts(req, res) {
    let search = "";

    if (req.query.search) {
      /**
       * Toda vez quando submetemos algo no input de text dentro daquele form, seus valores ficam como parametros na url, por isso os pegamos com o req.query
       */
      search = req.query.search;
    }
    //criando os códigos para order os pensamentos
    let order = "DESC"; //sempre das mais novas para as mais velhas

    //se vier um parametro de order pela req iremos conferi-lá
    if (req.query.order === "old") {
      order = "ASC"; // do mais antigo para o mais novo
    } else {
      order = "DESC";
    }

    //trazendo todos os pensamentos cadastrados

    const toughtsData = await Tought.findAll({
      include: User,
      /**
       * Like = tipo de busca do sql que me permite fazer um busca de filtro com palavras que contenha o que eu busquei, obtendo resultado semelhantes ao digitado.
       * Se ele vem vazio, não passa nenhum valor para busca então não ha problemas em realizar o filtro where aqui
       */
      where: {
        title: {
          [Op.like]: `%${search}%`,
          /**
           * quando quero filtrar por palavras que tenha/ contenha no meio, começo ou fim  o que foi digitado eu uso `%${variavel}%` (isso é um 'coringa')
           */
        },
      },
      order: [["createdAt", order]],
    });
    //mando um array com todos os pensamentos
    const toughts = toughtsData.map((result) => result.get({ plain: true }));

    //quantidade de toughts que eu tenho
    let toughtsQty = toughts.length;

    if (toughtsQty === 0) {
      toughtsQty = false;
    }

    res.render("toughts/home", { toughts, search, toughtsQty });
  }

  static async createToughtSave(req, res) {
    const tought = {
      title: req.body.title,
      UserId: req.session.userId,
    };

    try {
      await Tought.create(tought);

      req.flash("message", "Pensamento criado com sucesso");

      req.session.save(() => {
        res.redirect("/toughts/dashboard");
      });
    } catch (err) {
      console.log("Aconteceu um erro " + err);
    }
  }
  static async updateTought(req, res) {
    const id = req.params.id;

    const tought = await Tought.findOne({ where: { id: id }, raw: true });

    res.render("toughts/edit", { tought });
  }

  static async updateToughtPost(req, res) {
    const id = req.body.id;

    const tought = {
      title: req.body.title,
    };

    try {
      await Tought.update(tought, { where: { id: id } });

      req.flash("message", "Pensamento atualizado com sucesso");

      req.session.save(() => {
        res.redirect("/toughts/dashboard");
      });
    } catch (err) {
      console.log("Aconteceu um erro " + err);
    }
  }

  static async removeTought(req, res) {
    const UserId = req.session.userId; //pego o id do user pela sessao
    const id = req.body.id; // pego o id do pensamento pelo body

    try {
      await Tought.destroy({ where: { id: id, UserId: UserId } }); //removo o item de pensamento do banco onde o id é igual ao id, e seu user é igual ao user da sessao
      req.flash("message", "Pensamento removido com sucesso");

      req.session.save(() => {
        res.redirect("/toughts/dashboard");
      });
    } catch (err) {
      console.log("Aconteceu um erro " + err);
    }
  }

  static createTought(req, res) {
    res.render("toughts/create");
  }
};
