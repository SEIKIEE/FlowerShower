var pool = require('../mysql/ConnPool');

class Classes {

    /**
     * 
     * @param {string} classID 教学班ID
     * @param {Array} attr 附加属性, 取值可以是''
     * @return {Object} 结果集
     */
    async getClassDetail(classID, attr) {

    }

    async setClassDetail() {

    }

    /**
     * 
     * @param {string} classID 教学班ID
     * @return {Array} 满足条件的单条记录，不满足则为null
     */
    async getClassHeader(classID) {
        try {
            var conn = await pool.getConnection();
            console.log(classID);
            var ret = await conn.query("select course.courseName,course.courseDept,class.startTime,class.closeTime,user.userName from class inner join course inner join user on class.courseNumber=course.courseNumber and user.userID = class.teacherID where classID = ?", [classID]);
            console.log(ret);
            if (ret[0].length > 0) return ret[0][0];
            else return null;
        } catch (err) {
            console.log(err);
            return null;
        } finally {
            conn.release();
        }
    }


    /**
     * 判断用户是否属于某个课程（包括老师、助教、学生）并给出他们的用户类型和权限
     * 
     * @param {string} classID 
     * @param {string} userID
     * @return {Object} userID为用户ID, type为用户类型（0学生，1教师，2助教），privilege（掩码形式，0~15）
     */
    async isClassMember(classID, userID) {
        try {
            var conn = await pool.getConnection();
            var sql = "(select studentID as userID, 0 as type, 0 as privilege from take where classID = ? and studentID = ? limit 1) union \
                 (select teacherID as userID, 1 as type, 15 as privilege from class where classID = ? and teacherID = ? limit 1) union \
                 (select userID , 3 as type, privilege from assistant where classID = ? and userID = ? limit 1)";
            var params = [classID, userID, classID, userID, classID, userID];
            var ret = await conn.query(sql, params);
            if (ret[0].length > 0) return true;
            else return false;
        } catch (err) {
            console.log(err);
            return null;
        } finally {
            conn.release();
        }
    }

    /**
     * 获取教学班对应的学生信息包括成绩
     * 
     * @param {string} classID
     * @return {Array} 成功返回该教学班所有学生信息包括成绩，出错则返回null
     */
    async getClassMembers(classID) {
        try {
            var conn = await pool.getConnection();
            var sql = "select * from (select * from class_member where classID = ?) as X natural join \
                (select studentID, sum(mark) as projectScore from project_stat  where classID = ? group by studentID) as Y";
            var params = [classID, classID];
            var ret = await conn.query(sql, params);
            return ret[0];
        } catch (err) {
            console.log(err);
            return null;
        } finally {
            conn.release();
        }
    }

    /**
     * 教学班批量导入学生
     * 
     * @param {int} classID 
     * @param {Array} students 
     * @return {Array} 成功返回错误列表errList，出错则返回null
     */
    async importClassMembers(classID, students) {
        try {
            var errList = [];
            var conn = await pool.getConnection();
            for (let i = 0; i < students.length; i++) {
                try {
                    let sql = "insert into take(studentID, classID, usualGrade, examGrade) values (?, ?, ?, ?)";
                    let params = [students[i].studentID, classID, student[i].usualGrade, student[i].examGrade];
                    await conn.query(sql, params);
                } catch (err) {
                    errList.push({
                        index: i,
                        studentID: students[i].studentID,
                        errMsg: err.message
                    });
                }
            }
            return errList;
        } catch (err) {
            console.log(err);
            return null;
        } finally {
            conn.release();
        }
    }

    /**
     * 批量修改学生-教学班选课关系中的信息
     *
     * @param {int} classID
     * @param {Array} students
     * @return {Array} 成功返回错误列表errList，出错则返回null
     */
    async modifyClassMembers(classID, students) {
        try {
            var errList = [];
            var conn = await pool.getConnection();
            for (let i = 0; i < students.length; i++) {
                try {
                    let sql = "update take set usualGrade = ?, examGrade = ? where classID = ? and studentID = ?";
                    let params = [student[i].usualGrade, student[i].examGrade, classID, students[i].studentID];
                    await conn.query(sql, params);
                } catch (err) {
                    errList.push({
                        index: i,
                        studentID: students[i].studentID,
                        errMsg: err.message
                    });
                }
            }
            return errList;
        } catch (err) {
            console.log(err);
            return null;
        } finally {
            conn.release();
        }
    }

    /**
     * 批量删除学生-教学班选课关系中的信息
     *
     * @param {int} classID
     * @param {Array[int]} students
     * @return {Array} 成功返回错误列表errList，出错则返回null
     */
    async deleteClassMembers(classID, students) {
        try {
            var errList = [];
            var conn = await pool.getConnection();
            for (let i = 0; i < students.length; i++) {
                try {
                    let sql = "delete from take where classID = ? and studentID = ?";
                    let params = [classID, students[i]];
                    await conn.query(sql, params);
                    //删除该用户在教学班中的作业
                    //删除该用户在教学班中的分组信息
                    //删除该用户在教学班中的讨论、留言信息（不需要）
                    //删除该用户在教学班中的考试信息
                } catch (err) {
                    errList.push({
                        index: i,
                        studentID: students[i],
                        errMsg: err.message
                    });
                }
            }
            return errList;
        } catch (err) {
            console.log(err);
            return null;
        } finally {
            conn.release();
        }
    }

    /**
     * 获取该课程的分组信息
     * 
     * @param {string} classID 
     * @param {Object} conditions
     * @return {Object} eg:
     * +-----------+---------+---------+-------------+---------------+-----------------+-------------+
     * | studentID | groupID | classID | groupNumber | groupLeaderID | groupLeaderName | studentName |
     * +-----------+---------+---------+-------------+---------------+-----------------+-------------+
     * | 4444      |       1 | Class01 |           1 | 1111          | 应承峻          | 学生C        |
     * | 5555      |       1 | Class01 |           1 | 1111          | 应承峻          | 学生D        |
     * | 6666      |       1 | Class01 |           1 | 1111          | 应承峻          | 学生E        |
     * | 7777      |       1 | Class01 |           1 | 1111          | 应承峻          | 学生F        |
     * | NULL      |       2 | Class01 |           2 | 2222          | 学生A           | NULL        |
     * +-----------+---------+---------+-------------+---------------+-----------------+-------------+
     */
    async getGroups(classID) {
        try {
            var conn = await pool.getConnection();
            var sql = "select * from (select groupID, classID, groupNumber, groupLeaderID, userName as groupLeaderName \
                from class_group,user where groupLeaderID = userID) as P natural left outer join class_group_member natural left outer join \
                 (select userID as studentID, userName as studentName from user) as X where classID = ?";
            var params = [classID];
            var ret = await conn.query(sql, params);
            return ret[0];
        } catch (err) {
            console.log(err);
            return null;
        } finally {
            conn.release();
        }
    }

    /**
     * 教学班中新建一个分组
     * 
     * @param {string} classID 
     * @param {int} groupNumber 
     * @param {string} groupLeaderID 
     * @return {string} errMsg 若出错则返回出错信息，执行成功返回null
     */
    async createGroup(classID, groupNumber, groupLeaderID) {
        try {
            var conn = await pool.getConnection();
            //判断新建组的组长是否已经是本教学班某个分组的成员
            var sql = "select studentID from class_group_member where studentID = ? and groupID in \
                (select groupID from class_group where classID = ? group by groupID) ";
            var params = [groupLeaderID, classID];
            var ret = await conn.query(sql, params);
            if (ret[0].length > 0) {  //该组长已经是本教学班某个分组的成员
                throw "该组长已经是本教学班中某小组的成员！";
            } else {
                sql = "insert into class_group(classID, groupNumber, groupLeaderID) values(?, ?, ?)";
                params = [classID, groupNumber, groupLeaderID];
                ret = await conn.query(sql, params);
            }
            return null;
        } catch (err) {
            console.log(err);
            return err.message;
        } finally {
            conn.release();
        }
    }

    async deleteGroup(classID, groupLeaderID) {

    }

    async updateGroupLeader(classID, groupLeaderID, newGroupLeaderID) {

    }

    async insertStudentToGroup(classID, groupNumber, studentID) {

    }

    async removeStudentFromGroup(classID, studentID) {

    }

    async uploadMaterial(classID, chapterNumber, path, submitterID) {

    }

    async deleteMaterial(classID, chapterNumber, path) {

    }

}

module.exports = Classes;