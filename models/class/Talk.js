var pool = require("../mysql/ConnPool");

class Talk {
  constructor() {}

  /**
   * 用户发表帖子功能
   *
   * @param {String} title 标题
   * @param {String} content 内容
   * @param {String} time 时间
   * @return {int} 如果成功返回1，出错则返回0
   */
  async writeTalk(title, content, time) {
    try {
      var conn = await pool.getConnection();
      await conn.query(
        "insert into talk(talkID, courseID, title, content, time) values(1,1,?,?,?)",
        [title, content, time]
      );
      return 1;
    } catch (err) {
      console.log(err);
      return 0;
    } finally {
      conn.release();
    }
  }
}

module.exports = Talk;
