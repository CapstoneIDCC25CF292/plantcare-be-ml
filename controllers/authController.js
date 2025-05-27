const authRepo = require("../repositories/authRepository");

exports.signup = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const result = await authRepo.signup(email, username, password);
    res.status(201).json({
      message: "User created",
      data: result,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await authRepo.signin(email, password);
    res.status(200).json({
      message: "Login successful",
      data: {
        token,
      },
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const { id } = req.user;
    const data = await authRepo.me(id);
    res.status(200).json({
      message: "Fetch detail user successful",
      data: data,
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
