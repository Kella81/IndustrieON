// ============================================
// Models index
// Laadt alle modellen en definieert associaties
// ============================================

const sequelize = require('./database');
const User = require('./User');
const Activity = require('./Activity');
const Registration = require('./Registration');
const Poll = require('./Poll');
const PollOption = require('./PollOption');
const PollResponse = require('./PollResponse');
const Comment = require('./Comment');
const Feedback = require('./Feedback');

// Associaties
User.hasMany(Activity, { foreignKey: 'organizer_id', as: 'activiteiten' });
Activity.belongsTo(User, { foreignKey: 'organizer_id', as: 'organisator' });

User.hasMany(Registration, { foreignKey: 'user_id' });
Registration.belongsTo(User, { foreignKey: 'user_id', as: 'gebruiker' });

Activity.hasMany(Registration, { foreignKey: 'activity_id', onDelete: 'CASCADE' });
Registration.belongsTo(Activity, { foreignKey: 'activity_id' });

Activity.hasMany(Poll, { foreignKey: 'activity_id', onDelete: 'CASCADE' });
Poll.belongsTo(Activity, { foreignKey: 'activity_id' });

Poll.hasMany(PollOption, { foreignKey: 'poll_id', as: 'options', onDelete: 'CASCADE' });
PollOption.belongsTo(Poll, { foreignKey: 'poll_id' });

User.hasMany(PollResponse, { foreignKey: 'user_id' });
PollResponse.belongsTo(User, { foreignKey: 'user_id' });

PollOption.hasMany(PollResponse, { foreignKey: 'option_id', onDelete: 'CASCADE' });
PollResponse.belongsTo(PollOption, { foreignKey: 'option_id' });

Activity.hasMany(Comment, { foreignKey: 'activity_id', onDelete: 'CASCADE' });
Comment.belongsTo(Activity, { foreignKey: 'activity_id' });

User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'gebruiker' });

Comment.hasMany(Comment, { foreignKey: 'parent_id', as: 'reacties', onDelete: 'CASCADE' });
Comment.belongsTo(Comment, { foreignKey: 'parent_id', as: 'ouder' });

Activity.hasMany(Feedback, { foreignKey: 'activity_id', onDelete: 'CASCADE' });
Feedback.belongsTo(Activity, { foreignKey: 'activity_id' });

User.hasMany(Feedback, { foreignKey: 'user_id' });
Feedback.belongsTo(User, { foreignKey: 'user_id', as: 'gebruiker' });

async function initialiseerDatabase() {
  await sequelize.sync({ alter: false });
  console.log('Database tabellen succesvol aangemaakt');
}

module.exports = {
  sequelize,
  User,
  Activity,
  Registration,
  Poll,
  PollOption,
  PollResponse,
  Comment,
  Feedback,
  initialiseerDatabase
};
