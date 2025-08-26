// 사용자 정보를 관리하는 예제 코드
const users = [
  { name: 'Alice', age: 25, email: 'alice@example.com' },
  { name: 'Bob', age: 30, email: 'bob@example.com' },
  { name: 'Charlie', age: 28, email: 'charlie@example.com' },
];

function getUserByEmail(email) {
  return users.find(user => user.email === email);
}

function addUser(name, age, email) {
  if (!name || !age || !email) {
    console.log('⚠️  유효하지 않은 사용자 정보입니다!');
    return;
  }
  users.push({ name, age, email });
  console.log(`✅ 사용자 추가 완료: ${name}`);
}

function removeUser(email) {
  const index = users.findIndex(user => user.email === email);
  if (index === -1) {
    console.log(`⚠️ ${email} 사용자를 찾을 수 없습니다.`);
    return;
  }
  users.splice(index, 1);
  console.log(`🗑️ 사용자 삭제 완료: ${email}`);
}

function printAllUsers() {
  console.log('\n📌 현재 사용자 목록:');
  users.forEach((user, idx) => {
    console.log(`${idx + 1}. ${user.name} (${user.age}세) - ${user.email}`);
  });
  console.log('총 사용자 수:', users.length);
}

// 테스트 코드 실행
printAllUsers();
console.log('\n=== 사용자 추가 테스트 ===');
addUser('David', 29, 'david@example.com');
addUser('Eve', 27, 'eve@example.com');

console.log('\n=== 특정 사용자 조회 ===');
const found = getUserByEmail('alice@example.com');
console.log('검색 결과:', found);

console.log('\n=== 사용자 삭제 ===');
removeUser('bob@example.com');

console.log('\n=== 최종 사용자 목록 ===');
printAllUsers();
