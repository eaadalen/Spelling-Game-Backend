const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let projectSchema = mongoose.Schema({
  Title: {type: String, required: true},
  ProjectNumber: {type: String, required: true},
  Description: {type: String, required: true},
  Keywords: {type: String, required: true},
  FileLocation: {type: String, required: true},
  ProjectManager: {type: String, required: true},
  ProjectStaff: {type: String, required: true},
  Systems_and_Equipment: {type: String, required: true}
});

let userSchema = mongoose.Schema({
  Username: {type: String, required: true},
  Password: {type: String, required: true},
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.Password);
};

let Project = mongoose.model('Project', projectSchema);
let User = mongoose.model('User', userSchema);

module.exports.Project = Project;
module.exports.User = User;