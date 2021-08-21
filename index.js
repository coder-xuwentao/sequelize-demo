// 连接数据库
const { Sequelize, Op, Model, DataTypes } = require("sequelize");
require("./utils/console-color.js");

const sequelize = new Sequelize("sql_learn", "root", "asd123", {
    host: "localhost",
    dialect: "mysql",
    port: "3306",
    define: {
        freezeTableName: true,
    },
    logging: (msg) => console.log(msg.verbose),
});

// 检测连接
async function modelBasisLearn() {
    try {
        await sequelize.authenticate();
        console.info("Connection has been established successfully.".success);
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }

    // 初始化Model
    class User extends Model {}

    User.init(
        {
            // Model attributes are defined here
            firstName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            lastName: {
                type: DataTypes.STRING,
                // allowNull defaults to true
            },
        },
        {
            // Other model options go here
            sequelize, // We need to pass the connection instance
            modelName: "User", // We need to choose the model name
        }
    );
    // the defined model is the class itself
    // console.log(User === sequelize.models.User); // true

    console.log("===");
    // await User.sync({ alter: true });
    // console.log("用户模型表刚刚(重新)创建！");

    await sequelize.sync({ /*force*/ alter: true });
    console.log("所有模型均已成功同步.");
    console.log("===");
}

// 模型实例
async function modelInstance() {
    const User = sequelize.define("user", {
        name: DataTypes.TEXT,
        favoriteColor: {
            type: DataTypes.TEXT,
            defaultValue: "green",
        },
        age: DataTypes.INTEGER,
        cash: DataTypes.INTEGER,
    });

    await sequelize.sync({ force: true });

    const jane = await User.create({ name: "Jane", age: 1, cash: 1000 });
    // console.log(jane instanceof User); // true
    // console.log(jane.name); // "Jane"
    // console.log(jane.toJSON());
    // jane.name = "Ada";
    // the name is still "Jane" in the database
    // await jane.save();
    // await jane.destroy()
    // await jane.reload();

    await jane.increment("age", { by: 2 });
    await jane.reload();
    // console.log(jane.age);

    const Hapi = await User.create(
        { name: "Hapi", age: 1, cash: 1000 } /*,{fields:["name","age"]} */
    );
    await User.create(
        { name: "foo", age: 2, cash: 2000 } /*,{fields:["name","age"]} */
    );
    // const users = await User.findAll();

    let users;
    // try {
    //     users = await User.findAll({
    //         attributes: {
    //             // include: [[sequelize.fn("COUNT", sequelize.col("cash")), "n_cash"]],
    //             exclude: ["cash"],
    //         },
    //     });
    // } catch (error) {
    //     console.log(error);
    // }
    const { Op } = require("sequelize");
    try {
        users_2 = await User.findAll({
            // where: {
            //     [Op.or]: [{ age: 1 }, { age: 2 }],
            // },
            // where: sequelize.where(sequelize.fn('char_length', sequelize.col('name')), 4),
            // order:[
            //     // ['id','DESC' ],
            //     // sequelize.fn('max', sequelize.col('age')),
            //     sequelize.random(),
            // ]

            attributes: [
                "cash",
                "age",
                [sequelize.fn("COUNT", sequelize.col("age")), "n_age"],
            ],
            group: ["cash", "age"],
            limit: 2,
            offset: 1,
        });
    } catch (err) {
        console.log(err);
    }

    // console.log("-------", JSON.stringify(users_2, null, 2));

    // const amount = await User.count({
    //     where: {
    //         id: {
    //             [Op.gt]: 1,
    //         },
    //     },
    // });

    // console.log(`There are ${amount} projects with an id greater than 25`);

    const maxAge = await User.max("age", {
        where: {
            age: { [Op.lt]: 3 },
        },
    });
    // console.log(maxAge);

    let user_3;
    user_3 = await User.findByPk(1);
    // user_3 = await User.findOne({
    //     where:{
    //         cash:1000
    //     }
    // });

    // if (user_3 === null) {
    //     console.log("Not found!");
    // } else {
    //     console.log(user_3 instanceof User); // true
    //     console.log(user_3.toJSON());
    // }

    let [user_3_1, created] = await User.findOrCreate({
        where: { id: 4 },
        defaults: {
            name: "ababa",
            cash: 4000,
            age: 4,
        },
    });
    // console.log(created);
    if (created) {
        // console.log(user_3_1.toJSON());
    }

    const { count, rows } = await User.findAndCountAll({
        where: {
            id: {
                [Op.gt]: 1,
            },
        },
        offset: 1,
        limit: 2,
    });
    console.log(count);
    console.log(JSON.stringify(rows, null, 2));
}

// getter,setter,virtuals
async function getterAndSetter() {
    const User = sequelize.define("user", {
        username: {
            type: DataTypes.STRING,
            get() {
                const rawValue = this.getDataValue("username");
                return rawValue ? rawValue.toUpperCase() : null;
            },
        },
        password: {
            type: DataTypes.STRING,
            set(value) {
                // Storing passwords in plaintext in the database is terrible.
                // Hashing the value with an appropriate cryptographic hash function is better.
                this.setDataValue("password", value + 111);
            },
        },
        firstName: DataTypes.TEXT,
        lastName: DataTypes.TEXT,
        fullName: {
            type: DataTypes.VIRTUAL,
            get() {
                return `${this.firstName} ${this.lastName}`;
            },
            set(value) {
                throw new Error("Do not try to set the `fullName` value!");
            },
        },
    });

    await sequelize.sync({ force: true });

    // const user = User.build({
    //     username: "SuperUser123",
    //     password: "NotSo§tr0ngP4$SW0RD!",
    // });
    // console.log(user.username);
    // console.log(user.getDataValue("username"));
    // console.log(user.password);
    // console.log(user.getDataValue("password"));

    const user = await User.create({ firstName: "John", lastName: "Doe" });
    console.log(user.fullName); // 'John Doe'
}

async function Association() {
    const Ship = sequelize.define(
        "ship",
        {
            name: DataTypes.STRING,
            crewCapacity: DataTypes.INTEGER,
            amountOfSails: DataTypes.INTEGER,
        },
        { timestamps: false }
    );
    const Captain = sequelize.define(
        "captain",
        {
            name: DataTypes.STRING,
            skillLevel: {
                type: DataTypes.INTEGER,
                validate: { min: 1, max: 10 },
            },
        },
        { timestamps: false }
    );
    Captain.hasOne(Ship);
    Ship.belongsTo(Captain);
    await sequelize.sync({ force: true });
    await Captain.bulkCreate([
        { name: "Captain1" },
        { name: "Captain2" },
        { name: "Captain3" },
    ]);

    await Ship.bulkCreate([
        { name: "ship111", captainId: 1 },
        { name: "ship2", captainId: 2 },
        { name: "ship3", captainId: 3 },
    ]);

    const awesomeCaptain = await Captain.findOne({
        where: {
            name: "Captain1",
        },
    });
    const ships = await Ship.findAll({ include: Captain });
    // console.log(JSON.stringify(ships))
    // // 用获取到的 captain 做点什么
    // console.log("Name:", awesomeCaptain.name);
    // // 现在我们需要有关他的 ship 的信息!
    // const hisShip = await awesomeCaptain.getShip();
    // // 用 ship 做点什么
    // console.log("Ship Name:", hisShip.name);
    const Foo = await sequelize.define("foo", {
        name: DataTypes.STRING,
    });
    const Bar = await sequelize.define("bar", {
        name: DataTypes.STRING,
    });
    const Baz = await sequelize.define("baz", {});
    // Foo.hasOne(Bar)
    // Bar.belongsTo(Foo)
    // await sequelize.sync({ force: true });

    // const foo = await Foo.create({ name: "the-foo" });
    // const bar1 = await Bar.create({ name: "some-bar" });
    // const bar2 = await Bar.create({ name: "another-bar" });
    // console.log(111,await foo.getBar()); // null
    // await foo.setBar(bar1);
    // console.log((await foo.getBar()).name); // 'some-bar'
    // await foo.setBar(null); // Un-associate
    // // 必须清空才能重新设置
    // console.log(222,await foo.getBar()); // null
    // await foo.createBar({ name: "yet-another-bar" });
    // const newlyAssociatedBar = await foo.getBar();
    // console.log(newlyAssociatedBar.name); // 'yet-another-bar'
    // Foo.hasMany(Bar)
    Foo.belongsToMany(Bar, { through: Baz });

    await sequelize.sync({ force: true });
    const foo = await Foo.create({ name: "the-foo" });
    const bar1 = await Bar.create({ name: "some-bar" });
    const bar2 = await Bar.create({ name: "another-bar" });
    console.log(await foo.getBars()); // []
    console.log(await foo.countBars()); // 0
    console.log(await foo.hasBar(bar1)); // false
    await foo.addBars([bar1, bar2]);
    console.log(await foo.countBars()); // 2
    await foo.addBar(bar1);
    console.log(await foo.countBars()); // 2
    console.log(await foo.hasBar(bar1)); // true
    await foo.removeBar(bar2);
    console.log(await foo.countBars()); // 1
    await foo.createBar({ name: "yet-another-bar" });
    console.log(await foo.countBars()); // 2
    await foo.setBars([]); // Un-associate all previously associated bars
    console.log(await foo.countBars()); // 0
}

async function destroyParanoid() {
    class Post extends Model {}
    Post.init(
        {
            title: DataTypes.STRING,
        },
        {
            sequelize,
            paranoid: true,

            // If you want to give a custom name to the deletedAt column
            deletedAt: "destroyTime",
        }
    );
    await sequelize.sync({ force: true });
    const post = await Post.create({ title: "test" });
    console.log(post instanceof Post); // true
    await post.destroy();
    console.log("soft-deleted!");
    await post.restore();
    console.log("restored!");

    // Example showing the static `restore` method.
    // Restoring every soft-deleted post with more than 100 likes
    // await Post.restore({
    //     where: {
    //         likes: {
    //             [Op.gt]: 100,
    //         },
    //     },
    // });
}

async function eagerLoading() {
    const User = sequelize.define(
        "user",
        { name: DataTypes.STRING },
        { timestamps: false }
    );
    const Task = sequelize.define(
        "task",
        { name: DataTypes.STRING },
        { timestamps: false }
    );
    const Tool = sequelize.define(
        "tool",
        {
            name: DataTypes.STRING,
            size: DataTypes.STRING,
        },
        { timestamps: false }
    );
    User.hasMany(Task);
    Task.belongsTo(User);
    User.hasMany(Tool, { as: "Instruments" });
    await sequelize.sync({ force: true });

    const user1 = await User.create({ name: "user1" });
    const user2 = await User.create({ name: "user2" });
    const task1 = await user1.createTask({ name: "task1" });
    const task2 = await user1.createTask({ name: "task2" });

    // const tasks = await Task.findAll({ include: User, required: true });
    // const users = await User.findAll({
    //     include: {
    //         model: Task,
    //         where: {
    //             name: "task1",
    //         },
    //     },
    // });

    // const users = await User.findAll({
    //     where:{
    //         '$Task.name$':"task1"
    //     },
    //     include: {
    //         model: Task,
    //     },
    // });

    const users = await User.findAll({
        where: {
            "$tasks.name$": { [Op.ne]: "task1" },
        },
        include: {
            model: Task,
            required: true,
        },
    });
    // console.log(JSON.stringify(tasks, null, 2));
    // console.log(JSON.stringify(users, null, 2));

    const Foo = sequelize.define("Foo", { name: DataTypes.TEXT });
    const Bar = sequelize.define("Bar", { name: DataTypes.TEXT });
    Foo.belongsToMany(Bar, { through: "Foo_Bar" });
    Bar.belongsToMany(Foo, { through: "Foo_Bar" });

    await sequelize.sync({ force: true });
    const foo = await Foo.create({ name: "foo" });
    const bar = await Bar.create({ name: "bar" });
    await foo.addBar(bar);
    // const fetchedFoo = await Foo.findOne({ include: Bar });
    // const fetchedFoo = await Foo.findAll({
    //     include: [
    //         {
    //             model: Bar,
    //             // attributes:[]
    //             through: {
    //                 // attributes: ["FooId"],
    //                 attributes:[]
    //             },
    //         },
    //     ],
    // });

    // const fetchedFoo = await Foo.findAll({ include: { all: true } });

    // 递归获取与用户及其嵌套关联关联的所有模型
    const fetchedFoo = await Foo.findAll({
        include: { all: true, nested: true },
    });

    console.log(JSON.stringify(fetchedFoo, null, 2));
}

async function creatingWithAssociations() {
    class Product extends Model {}
    Product.init(
        {
            title: Sequelize.STRING,
        },
        { sequelize, modelName: "product" }
    );
    class User extends Model {}
    User.init(
        {
            firstName: Sequelize.STRING,
            lastName: Sequelize.STRING,
        },
        { sequelize, modelName: "user" }
    );
    class Address extends Model {}
    Address.init(
        {
            type: DataTypes.STRING,
            line1: Sequelize.STRING,
            line2: Sequelize.STRING,
            city: Sequelize.STRING,
            state: Sequelize.STRING,
            zip: Sequelize.STRING,
        },
        { sequelize, modelName: "address" }
    );

    // 我们保存关联设置调用的返回值,以便以后使用
    Product.User = Product.belongsTo(User);
    User.Addresses = User.hasMany(Address);
    // 也适用于 `hasOne`

    await sequelize.sync({ force: true });

    return Product.create(
        {
            title: "Chair",
            user: {
                firstName: "Mick",
                lastName: "Broadstone",
                addresses: [
                    {
                        type: "home",
                        line1: "100 Main St.",
                        city: "Austin",
                        state: "TX",
                        zip: "78704",
                    },
                ],
            },
        },
        {
            include: [
                {
                    association: Product.User,
                    include: [User.Addresses],
                },
            ],
        }
    );
}

async function MtoNAssociation() {
    const User = sequelize.define(
        "user",
        {
            username: DataTypes.STRING,
            points: DataTypes.INTEGER,
        },
        { timestamps: false }
    );
    const Profile = sequelize.define(
        "profile",
        {
            name: DataTypes.STRING,
        },
        { timestamps: false }
    );

    /*
    
    const User_Profile = sequelize.define(
        "User_Profile",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            selfGranted: DataTypes.BOOLEAN,
        },
        { timestamps: false }
    );
    User.belongsToMany(Profile, { through: User_Profile });
    Profile.belongsToMany(User, { through: User_Profile });
    await sequelize.sync({ force: true });

    const amidala = await User.create({ username: "p4dm3", points: 1000 });
    const queen = await Profile.create({ name: "Queen" });
    await amidala.addProfile(queen, { through: { selfGranted: false } });
    const result = await User.findOne({
        where: { username: "p4dm3" },
        include: Profile,
    });
    // console.log(result);

    const amidala1 = await User.create(
        {
            username: "p4dm4",
            points: 1000,
            profiles: [
                {
                    name: "Queen",
                    User_Profile: {
                        selfGranted: true,
                    },
                },
            ],
        },
        {
            include: Profile,
        }
    );

    const result1 = await User.findOne({
        where: { username: "p4dm4" },
        include: Profile,
    });

    console.log(result1);
    */
    // 超级连接表
    const Grant = sequelize.define(
        "grant",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            selfGranted: DataTypes.BOOLEAN,
        },
        { timestamps: false }
    );
    User.belongsToMany(Profile, { through: Grant });
    Profile.belongsToMany(User, { through: Grant });

    sequelize.sync({ force: true });
}

async function polymorphicAssociations() {
    // Helper 方法
    const uppercaseFirst = (str) => `${str[0].toUpperCase()}${str.substr(1)}`;

    class Image extends Model {}
    Image.init(
        {
            title: DataTypes.STRING,
            url: DataTypes.STRING,
        },
        { sequelize, modelName: "image" }
    );

    class Video extends Model {}
    Video.init(
        {
            title: DataTypes.STRING,
            text: DataTypes.STRING,
        },
        { sequelize, modelName: "video" }
    );

    class Comment extends Model {
        getCommentable(options) {
            if (!this.commentableType) return Promise.resolve(null);
            const mixinMethodName = `get${uppercaseFirst(
                this.commentableType
            )}`;
            return this[mixinMethodName](options);
        }
    }
    Comment.init(
        {
            title: DataTypes.STRING,
            commentableId: DataTypes.INTEGER,
            commentableType: DataTypes.STRING,
        },
        { sequelize, modelName: "comment" }
    );

    Image.hasMany(Comment, {
        foreignKey: "commentableId",
        constraints: false,
        scope: {
            commentableType: "image",
        },
    });
    Comment.belongsTo(Image, {
        foreignKey: "commentableId",
        constraints: false,
    });

    Video.hasMany(Comment, {
        foreignKey: "commentableId",
        constraints: false,
        scope: {
            commentableType: "video",
        },
    });
    Comment.belongsTo(Video, {
        foreignKey: "commentableId",
        constraints: false,
    });

    Comment.addHook("afterFind", (findResult) => {
        if (!Array.isArray(findResult)) findResult = [findResult];
        for (const instance of findResult) {
            if (
                instance.commentableType === "image" &&
                instance.image !== undefined
            ) {
                instance.commentable = instance.image;
            } else if (
                instance.commentableType === "video" &&
                instance.video !== undefined
            ) {
                instance.commentable = instance.video;
            }
            // 防止错误:
            delete instance.image;
            delete instance.dataValues.image;
            delete instance.video;
            delete instance.dataValues.video;
        }
    });

    await sequelize.sync({ force: true });
    const image = await Image.create({ title: "图片标题", url: "###" });
    await image.createComment({ title: "Awesome!" });
    const com1 = await image.getComments();

    const comment1 = await Comment.create({ title: "11Awesome!" });
    await image.addComments(comment1);
    const com2 = await image.getComments();
    console.log(JSON.stringify(com1, null, 2));
    console.log(JSON.stringify(com2, null, 2));

    const comments = await Comment.findAll({
        include: [Image, Video],
    });
    for (const comment of comments) {
        const message = `Found comment #${comment.id} with ${comment.commentableType} commentable:`;
        console.log(message, comment.commentable.toJSON());
    }
}

// creatingWithAssociations();
// MtoNAssociation();
polymorphicAssociations();
