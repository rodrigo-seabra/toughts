const User = require("../models/User");

//criar a senha e descriptografar a senha do user
const bcrypt = require("bcryptjs");

module.exports = class AuthController {
  static async login(req, res) {
    res.render("auth/login");
  }
  static async register(req, res) {
    res.render("auth/register");
  }
  static async loginPost(req, res) {
    const { email, password } = req.body; //extraindo esses dois dados do body

    //FAENDO VALIDAÇÕES
    //se o user existe
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      req.flash("message", "Usuário nao encontrado");
      res.render("auth/login");
      return;
    }
    ///se a senha está correta
    const passwordMatch = bcrypt.compareSync(password, user.password); //função do bcrypt responsavel por verificar as senhas se estão iguais ("por debaixo dos panos"), isso retornará um valor verdadeiro ou falso

    if (!passwordMatch) {
      req.flash("message", "Senha inválida");
      res.render("auth/login");
      return;
    }

    //caso tudo esteja correto
    req.session.userId = user.id;

    req.flash("message", "Autenticação realizada com sucesso");

    // crio uma arrow function que garante que a sessao seja criada antes de redirecionar o usuário
    req.session.save(() => {
      res.redirect("/");
    });
  }
  static async logout(req, res) {
    req.session.destroy(); //destruimos a sessao criada (o cookie)
    res.redirect("/login");
  }
  static async registerPost(req, res) {
    //fazer validações - não sei se o user enviou os dados certos:
    const { name, email, password, confirmpassword } = req.body;

    //validação de senha / password match validation

    if (password != confirmpassword) {
      //se a senha for diferente da confirmação de senha eu vou enviar uma mensagem para o front
      req.flash("message", "As senhas não conferem, tente novamente!"); //o primeiro dado é a chave e o segundo é o valor
      res.render("auth/register");
      return;
    }

    //checando se o user existe / check if user exists
    const checkIfUserExists = await User.findOne({ where: { email: email } });
    if (checkIfUserExists) {
      req.flash("message", "O email ja está em uso"); //o primeiro dado é a chave e o segundo é o valor
      res.render("auth/register");
      return;
    }

    //criando um senha
    //dificultando mais ainda a senha
    const salt = bcrypt.genSaltSync(10); // colocando 10 caracteres aleatórios no meio dos códigos da senha

    const hashedPassword = bcrypt.hashSync(password, salt); //mando a senha do user em si e o salt, e assim  o bcrypt gera a senha segura para mim

    const user = {
      name,
      email,
      password: hashedPassword,
    };

    try {
      const createdUser = await User.create(user);

      //criando a sessão / initialize session
      req.session.userId = createdUser.id;

      req.flash("message", "Cadastro realizado com sucesso");

      // crio uma arrow function que garante que a sessao seja criada antes de redirecionar o usuário
      req.session.save(() => {
        res.redirect("/toughts");
      });
    } catch (err) {
      console.log(err);
    }
  }
};
