var GC = artifacts.require("GatedCommunity");
module.exports = deployer => {
    deployer.deploy(GC, "GatedCommunity", "GC");
};