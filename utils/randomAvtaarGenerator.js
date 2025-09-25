const generateRandomAvtaar = () => {
  const max = 27546624;
  const randomNumber = Math.floor(Math.random() * (max + 1));
  return randomNumber;
};

module.exports = { generateRandomAvtaar };
