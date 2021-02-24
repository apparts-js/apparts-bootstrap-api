const { useModel, makeModel } = require("@apparts/model");

const types = {
  id: {
    type: "id",
    public: true,
    auto: true,
    key: true,
  },
};

const [Resources, _Resource, NoResource] = useModel(types, "resource");

class Resource extends _Resource {
  constructor(dbs, content) {
    super(dbs, content);
    /* do usefull stuff */
  }
  additionalFunc() {
    return this.content;
  }
}

module.exports = makeModel("Resource", [Resources, Resource, NoResource]);
