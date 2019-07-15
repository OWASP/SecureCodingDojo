function HelloWorld(message) {
  return (
    <div>
      <h1>Hello!</h1>
      <p dangerouslySetInnerHTML={{ __html: message }} />;
    </div>
  );
}
