const _NAMESPACE = {
  RES_MSG: {
    OK: "요청 성공적",
    BAD_REQUEST: "유효하지 않은 요청",
    NOT_FOUND: "해당 데이터 없음",
    METHOD_NOT_ALLOWED: "허용되지 않은 메소드",
    INTERNAL_SERVER_ERROR: "서버 내부 에러",
    //
    INSUFFICIENT_VALUE: "필요한 인자가 제공되지 않음",
    TYPE_MISMATCH: "자료형이 일치하지않음",
    DUPLICATED_PK: "고유키 중복",
    NO_SUCH_PATH: "요청 경로 잘못됨",
    SYNTAX_ERROR: "구문 오류",
    UUID_OR_EMAIL: "UUID와 EMAIL을 동시에 인자로 사용할 수 없음",
    IT_IS_NOT_YOUR_PARTS: "파츠 소유자 불일치",
  },
};

module.exports = _NAMESPACE;
