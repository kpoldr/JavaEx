
module.exports = {
    devtool: 'source-map',
    output: {
        filename: 'react-application.js'
    },
    module: {
        rules: [{
            test: /\.(ts|tsx)$/,
            exclude: /node_modules/,
            loader: "babel-loader",
            options: {
                presets: ['@babel/preset-env', ['@babel/preset-react', {"runtime": "automatic"}], '@babel/preset-typescript']
            }
        }, 
        {
            test: /\.(css|scss)$/,
            use: ["style-loader", "css-loader"],
        },
        {
            test: /\.(jpg|jpeg|png|gif|mp3|svg)$/,
            use: ["file-loader"],
        },]
    },
    resolve: {
        extensions: ['.js' ,'.ts', '.tsx']
    },
};

