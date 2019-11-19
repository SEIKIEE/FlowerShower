# 项目须知

#### 操作步骤（注意！！！一定要认真看）

- 使用`git clone`命令将分支克隆到本地。

- 由于`node`的中间件较重，为了减少项目体积我在`gitignore`中将其忽略。**所以第一次克隆时，请务必在命令行中执行`npm install`（没装`npm`和`node.js`的自己去按照）安装必要的中间件！**

- 在开发自己的代码前，请使用`git checkout -b <你的分支名>`命令新建(并转到)你自己的分支，然后再在你自己的分支上提交，分支提交命令：

    ```bash
    git add <文件列表>
    git commit -m "<分支提交信息>"
    git push origin <你的分支名>
    
    [eg]
    git checkout -b ycj
    git add .    #添加所有文件
    git commit -m "对×××模块的×××部分进行更新"
    git push origin ycj
    ```

    此外再提供一些常用的git命令：

    ```bash
    git branch <分支名>    #新建一个分支
    git checkout <分支名>  #转到某一个分支
    git branch -d <分支名> #删除某个分支
    ```

    ##### 其他Git命令请自行学习，参考资料：廖雪峰的Git教程。

    ##### 把Git仓库搞坏了就出来挨打！

- EXPRESS项目结构说明：

    - bin/www：文件中配置了端口，本项目端口为80
    - models：封好的方法、数据库操作模块等等，本项目采用**面向对象编程**
        - class：封装类（es6语法）
        - method：一些常用方法，比如格式化日期...，类似于`utils`的作用
        - statics：静态变量（常量）
    - node_modules: node中间件
    - routes: 路由配置
    - views：视图层，即网页，这里使用ejs模板动态渲染（语法可以去学习下，很简单）
    - app.js：全局配置文件

- 项目运行方法：
    - 命令行输入`npm start`启动项目
    - 浏览器中输入`localhost:80`运行

