var DataTypes = ( function() {
    const Acolhido = class Acolhido {}

    const Residente = class Residente {}

    const Familia = class Familia {}

    const Documento = class Documento {}

    const Admin = class Admin {}

    const Apoiador = class Apoiador {}

    return { Acolhido, Residente, Familia, Documento, Admin, Apoiador };
} )();

module.exports = DataTypes;