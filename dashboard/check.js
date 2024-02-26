const { object, string, number, array, boolean, mixed } = require('yup');

var max = 1_000_000;
let info;

async function validate (options, db) {
    var validOptions = ['daily', 'claim', 'work', 'crime', 'explore', 'craft.items', 'materials', 'shop.items', 'prefix'];
    var requiresUpdate = ['craft.items', 'shop.items'];
    if (!validOptions.includes(options.setting)) return { valid: false, parsed: {}, err: ['invalid setting type'] };

    try {
        info = db;
	    const parsed = validations[options.setting].cast(options.data);
	    validations[options.setting].validateSync(options.data, { abortEarly: false });
        
        return { valid: true, parsed: parsed, err: ["Cambios guardados"], requiresUpdate: requiresUpdate.includes(options.setting) };
    } catch(err) {
	    if (!err.errors) console.error(err);
        return { valid: false, parsed: {}, err: err.errors ?? ["Error desconocido"], requiresUpdate: false };
    }
}

const validations = {
    'prefix': string().required().min(1).max(20),

    'daily': object({
        txt: string().optional().max(2000),
        reward: object().shape({
            type: string().required().oneOf(['cash', 'inv.']),
    
            amount: number().when('type', {
                is: 'cash',
                then: () => number().required().min(0).max(max)
            }),

            materials: object().when('type', {
                is: 'inv.',
                then: () => object().test({
                    test: (value) => {
                        const values = Object.values(value)[0];
                        const objects = Object.keys(value);

                        var validObject = true;
                        for (x of objects) {
                            let obj = info.craft.items.find(k => k.name === x) || info.materials.find(k => k.name === x);
                            if (!obj) {
                                validObject = false;
                                break;
                            }
                        }

                        if (!validObject) return false;
                        if (values.length !== 2) return false;
                        let [value1, value2] = values;
			            value1 = Number(value1);
			            value2 = Number(value2);
                        if (!Number.isInteger(value1) || !Number.isInteger(value2)) return false;
                        return typeof value1 === 'number' && typeof value2 === 'number' && value1 <= value2;
                    },
                    message: "amount or object not valid"
                }),
                otherwise: () => mixed().notRequired()
            })
    
        }).required().test({
            exclusive: true,
            name: 'at-least-one',
            test: (value) => value.amount !== undefined || value.materials !== undefined,
            message: "missing amount or materials"
        }).noUnknown()

    }).noUnknown(),

    'claim': object({
        txt: string().optional().max(2000),
        cooldown: number().required().min(1).integer(),
        reward: object().shape({
            type: string().required().oneOf(['cash', 'inv.']),
    
            amount: number().when('type', {
                is: 'cash',
                then: () => number().required().min(0).max(max)
            }),
            materials: object().when('type', {
                is: 'inv.',
                then: () => object().required().test({
                    test: value => {
                        const values = Object.values(value)[0];
                        const objects = Object.keys(value);

                        var validObject = true;
                        for (x of objects) {
                            let obj = info.craft.items.find(k => k.name === x) || info.materials.find(k => k.name === x);
                            if (!obj) {
                                validObject = false;
                                break;
                            }
                        }

                        if (!validObject) return false;
                        if (values.length !== 2) return false;
                        let [value1, value2] = values;
			            value1 = Number(value1);
                        value2 = Number(value2);
                        if (!Number.isInteger(value1) || !Number.isInteger(value2)) return false;
                        return typeof value1 === 'number' && typeof value2 === 'number' && value1 >= 0 && value1 <= value2;
                    },
                    message: "amount or object not valid"
                }),
                otherwise: () => mixed().notRequired()
            })
    
        }).required().test({
            exclusive: true,
            name: 'at-least-one',
            test: (value) => value.amount !== undefined || value.materials !== undefined,
            message: "missing amount or materials"
        }).noUnknown()

    }).noUnknown(),

    'work': object({
        txt: array().optional().max(3).of(string().max(2000)),
        cooldown: number().required().min(1).integer(),
        min: number().required().min(0).max(max).integer(),
        max: number().required().min(0).max(max).integer()
    }).test({ test: (value) => value.min <= value.max, message: "work min is higher than max" }).noUnknown(),

    'crime': object({
        cooldown: number().required().min(1).integer().integer(),
        probability: number().required().min(0).max(100).integer(),
        
        success: object({
            min: number().required().min(0).max(max).integer(),
            max: number().required().min(0).max(max).integer(),
            txt: array().optional().max(3).of(string().max(2000))
        }).test({ test: (value) => value.min <= value.max, message: "success min is higher than max" }).noUnknown(),
    
        fail: object({
            min: number().required().min(0).max(max).integer(),
            max: number().required().min(0).max(max).integer(),
            txt: array().optional().max(3).of(string().max(2000))
        }).test({ test: (value) => value.min <= value.max, message: "fail min is higher than max" }).noUnknown()
    }).noUnknown(),

    'explore': object({
        txt: object({
            success: array().optional().max(3).of(string().max(2000)),
            fail: array().optional().max(3).of(string().max(2000))
        }).optional().noUnknown(),

        cooldown: number().required().min(1).integer(),
        materials: object().required().test({
            test: (value) => {
                const values = Object.values(value)[0];
                const objects = Object.keys(value);

                var validObject = true;
                for (x of objects) {
                    let obj = info.materials.find(k => k.name === x) || info.craft.items.find(k => k.name === x);
                    if (!obj) {
                        validObject = false;
                        break;
                    }
                }

                if (!validObject) return false;
                if (values.length !== 2) return false;
                let [value1, value2] = values;
		        value1 = Number(value1);
		        value2 = Number(value2);
                if (!Number.isInteger(value1) || !Number.isInteger(value2)) return false;
                return typeof value1 === 'number' && typeof value2 === 'number' && value1 >= 0 && value1 <= value2;
            },
            message: "amount or object not valid"
        })
    }).noUnknown(),

    'craft.items': array().max(10).required().of(object({
        name: string().max(70).min(3).required(),
        description: string().min(1).max(70).optional(),
        probability: number().min(0).max(100).required().integer(),
    
        materials: object().required().test({
            test: (value) => {
                const material = Object.values(value);
                var valid = true;
                material.forEach(amount => {
		        amount = Number(amount);
                if (isNaN(amount) || !Number.isInteger(Number(amount)) || amount < 0 || amount > max) valid = false;
                })
                return valid;
            },
            message: "amount not valid"
        })
    }).noUnknown()).test({
        test: (value) => {
            for (let i = 0; i < value.length; i++) {
                for (let j = i + 1; j < value.length; j++) {
                  if (value[i].name === value[j].name) {
                    return false;
                  }
                }
            }

            return true;
            
        },
        message: "duplicated object"
    }),

    'materials': array().max(10).required().of(object({
        name: string().max(70).min(3).required(),
        description: string().min(1).max(70).optional()
    }).noUnknown()).test({
        test: (value) => {
            for (let i = 0; i < value.length; i++) {
                for (let j = i + 1; j < value.length; j++) {
                  if (value[i].name === value[j].name) {
                    return false;
                  }
                }
            }

            return true;
            
        },
        message: "duplicated material"
    }),

    'shop.items': array().max(10).required().of(object({
        name: string().max(70).min(3).required(),
        description: string().min(1).max(70).optional(),
        onlyOnce: boolean().optional().default(false),
    
        price: object({
            type: string().required().matches(/(^cash$|^inv.{4,70}$)/).test({
                test: (value) => {
                    if (value === 'cash') return true;
                    return info.craft.items.find(x => x.name == value.replace('inv.', '')) ? true : false;
                }
            }),
            amount: number().when('type', {
                is: (value) => value === 'cash' || value.startsWith('inv.'),
                then: () => number().required().min(0).max(max).integer()
            }),

        }).required().test({ test: (value) => value.amount !== undefined || value.id !== undefined, message: "missing amount or id" }).noUnknown(),
        reward: object({
            type: string().required().matches(/(^cash$|^role$|^inv.{4,70}$)/).test({
                test: (value) => {
                    if (value === 'cash' || value === 'role') return true;
                    return info.craft.items.find(x => x.name == value.replace('inv.', '')) ? true : false;
                }
            }),
            amount: number().when('type', {
                is: (value) => value === 'cash' || value.startsWith('inv.'),
                then: () => number().required().min(0).max(max).integer()
            }),
            id: number().when('type', {
                is: 'role',
                then: () => number().required().min(0).integer()
            })
        }).required().noUnknown()

    }).noUnknown()).test({
        test: (value) => {
            for (let i = 0; i < value.length; i++) {
                for (let j = i + 1; j < value.length; j++) {
                  if (value[i].name === value[j].name) {
                    return false;
                  }
                }
            }

            return true;
            
        },
        message: "duplicated object"
    })
};

module.exports = { validate };
